---
title: "Moving SSH Behind a VPN with Per-Engineer Accounts for Small Teams"
date: "2026-09-02"
excerpt: "How to move SSH behind a VPN with per-engineer accounts for a small dev team: the reasons, the setup, sshd Match examples, and a practical offboarding process."
tags: ["security", "ssh", "vpn", "devops", "team-management"]
---

This year I moved SSH access for all our servers behind a VPN and switched from shared accounts to per-engineer accounts. The work isn't technically hard, but it changed how a small team thinks about security quite a lot. This post summarizes the reasons, a generic setup that works with WireGuard or OpenVPN, and the offboarding steps I actually use.

## Why SSH Behind a VPN Is Worth It for Small Teams

Small teams often think "nobody cares about our servers", but the reality is that bots scan port 22 across the whole internet all the time. If SSH is open to the public, all that protects us is a key or a password, and if either leaks once, it's over.

Putting SSH behind a VPN adds two layers of protection:

- **Smaller attack surface**: the SSH port answers no one except people on the VPN
- **Knowing who got in**: if everyone has their own VPN account and SSH account, the logs tell you right away who accessed which machine and when

Another reason that matters just as much is shared accounts, such as everyone using `root` or `deploy` with the same key. When someone leaves the team, we have to change the key on every machine, and there's no way to know where the old key has been copied. Per-engineer accounts solve this directly.

## Overall Structure

The overview I use has only three parts:

1. **One VPN server** that issues a separate config to each person (one person, one profile) and enables MFA if the system supports it
2. **Split tunnel**: only traffic to the servers' subnet goes through the VPN, and other traffic goes out on the normal internet, so the team doesn't complain about slow internet
3. **Firewall + sshd** on each server, accepting SSH only from the VPN's outbound IP or the internal subnet

A point many people get wrong is writing firewall rules based on the tunnel subnet when some VPNs do NAT before forwarding, so the destination server sees the source IP as the VPN server's IP, not an IP inside the tunnel. The easiest check is to connect to the VPN, SSH in, and look at `who` or `last` to see which IP the machine sees you coming from, then write the rules accordingly.

## sshd Match Rule Examples

I didn't want to shut off public SSH completely in one go, because if the VPN goes down we couldn't reach the machines at all. So I use `Match` in `sshd_config` to restrict only the team's accounts, and use the cloud provider's console for emergency accounts instead.

```bash
# /etc/ssh/sshd_config (end of file)
PasswordAuthentication no
PermitRootLogin no

# Team accounts: accept only from the VPN
Match User alice,bob,carol Address 10.8.0.0/24,203.0.113.10
    AllowUsers alice bob carol

# If coming from anywhere else, deny all team accounts
Match User alice,bob,carol Address *,!10.8.0.0/24,!203.0.113.10
    DenyUsers alice bob carol
```

Always test the config before reloading, and keep the existing session open in another window so you don't lock yourself out:

```bash
sudo sshd -t && sudo systemctl reload sshd
# Test from another terminal, both with and without the VPN connected
ssh -v alice@server.example.com
```

Test both cases: with the VPN connected you must be able to get in, and without it you must not. If you only check the first case, you'll never know whether the rules actually work.

## Create Per-Engineer Accounts Systematically

I wrote a short onboarding checklist for each person:

- Create a VPN profile named after the person, not a generic name like `dev1`
- Create a Linux user only on the machines that person actually needs, not every machine
- Put their public key in `~/.ssh/authorized_keys`, and never send a private key over chat
- Grant `sudo` only to people who need to deploy, and restrict the commands if possible
- Record in a central table who has which permissions on which machine

This central table matters most, because on the day of offboarding we won't have to guess what to remove and where.

## Offboarding: Revoke Everything in Ten Minutes

The goal is that when someone leaves the team, we can revoke access completely and quickly. The order I use:

1. **Disable the VPN profile first.** This one step already cuts off all network access.
2. **Lock the Linux account** with `usermod -L` and remove the key from `authorized_keys` on every machine in the table.
3. **Rotate secrets that person has seen**, such as database passwords or API keys that were shared so they could work.
4. **Keep the home directory for now.** Don't delete it yet, in case a script or cron job is tied to that account.
5. **Update the central table** and record the date access was revoked.

On the first day I always choose "lock" over "delete", because deleting an account that has processes or files attached can break other things without you noticing. After about a week, delete it for real.

## Real-World Cautions

- **Don't forget an emergency path.** If the VPN goes down, you need a way into the machines through the cloud provider's console, and you must test beforehand that it works.
- **The VPN server is the one point that needs the best care.** Update it regularly, enable MFA, and restrict the admin page from public access.
- **Web vhosts and SSH are separate matters.** Moving SSH behind a VPN doesn't make the web app any safer. They need to be handled separately.
- **Write a runbook** covering everything from adding a person to revoking access. I wrote about this idea in [turn every deploy into a runbook](/en/blog/turn-every-deploy-into-runbook).

For a broader look at security lessons for small teams, see [lessons from a security incident](/en/blog/security-incident-lessons-small-team).

## Summary

Moving SSH behind a VPN with per-engineer accounts takes only a few days but pays off long-term: a smaller attack surface, knowing who accessed which machine, and offboarding completed in minutes. The core is to go step by step, test both the can-get-in and can't-get-in cases, always keep an emergency path, and keep a central table of who has which permissions. A small team doesn't need expensive tools, just discipline.
