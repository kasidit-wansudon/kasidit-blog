---
title: "Cloud Printing with Epson Connect and Capturing Print Jobs via CUPS"
date: "2026-03-18"
excerpt: "Cloud printing architecture using the Epson Connect API plus CUPS print job capture, to print from a web app to branch printers, with real gotchas."
tags: ["cloud-printing", "cups", "epson-connect", "architecture"]
---

Printing looks like a small problem, until a cloud web app has to print a document on a printer somewhere else. In my work at OPPO Mexico, I had to make an internal system print without making users download a PDF and print it themselves, and I had to keep every print job so it could be checked later. The solution was cloud printing with Epson Connect, combined with capturing print jobs through CUPS. This post covers the architecture and the gotchas I hit.

## The problem

- The web app runs on a cloud server, not on the same network as the printers
- The printers are in several locations
- We want a copy of every printed job, for audit and reprinting
- Some legacy programs print through a normal driver, and we cannot change their code

## Overall architecture

I split it into two paths.

**Path 1: the web app prints directly through Epson Connect**

1. The web app generates a PDF on the server side
2. It creates a job in our own queue, storing the file and metadata (who, when, which printer)
3. A worker picks up the job and calls the Epson Connect API: request a token, create a print job, upload the file, execute
4. The worker polls the job status until it finishes, then writes the result back to the database

**Path 2: legacy programs print through CUPS**

1. Set up a CUPS server as a "virtual printer" for the legacy programs to print to
2. A custom CUPS backend receives the file and saves a copy
3. It forwards the file into the same queue as path 1, ending at Epson Connect

The benefit is that every job, wherever it comes from, goes through one queue, has one log, and can be retried with the same mechanism.

## Capturing print jobs with a CUPS backend

CUPS lets you write a backend as a plain script. Here is the basic skeleton.

```bash
#!/bin/bash
# /usr/lib/cups/backend/capture
# CUPS calls: backend job-id user title copies options [file]

if [ $# -eq 0 ]; then
  echo 'direct capture "Unknown" "Print capture backend"'
  exit 0
fi

JOB_ID="$1"; USER_NAME="$2"; TITLE="$3"
SPOOL_DIR="/var/spool/print-capture"
OUT="${SPOOL_DIR}/$(date +%Y%m%d%H%M%S)-${JOB_ID}.pdf"

if [ -n "$6" ]; then
  cp "$6" "$OUT"
else
  cat > "$OUT"
fi

# Hand off to the app queue (local HTTP endpoint)
curl -sf -X POST http://127.0.0.1:8080/print-jobs \
  --form-string "user=${USER_NAME}" \
  --form-string "title=${TITLE}" \
  -F "file=@${OUT}" || exit 1   # CUPS_BACKEND_FAILED

exit 0
```

Then create a printer that uses this backend with `lpadmin -p capture -E -v capture:/ -m everywhere`, or define a PPD that outputs PDF in the way your system needs.

## Gotchas I hit in practice

**Backend permissions.** CUPS runs backends as a restricted user. If the backend file has overly broad permissions, CUPS may run it as a user other than the one you expect. Set the owner and mode as the CUPS documentation says, and check that the spool directory is actually writable.

**The format is not always PDF.** It depends on the driver and filters the source program uses. Sometimes you get PostScript or raster. You need to define a filter chain that converts to PDF before the backend, or convert it yourself in the worker.

**AppArmor or SELinux blocks.** A backend that calls the network or writes files outside its normal paths may be blocked silently. Check the security module's log, not just the CUPS log.

**Epson Connect tokens expire.** The worker has to handle token refresh itself, and must not let several workers refresh at once and collide. I used a short lock around the refresh step.

**Job status is not immediate.** A successful execute call does not mean the print succeeded. You have to keep polling the status and set a timeout for how long counts as a failure, for example when the printer is off or out of paper.

**File size and page count.** Large files upload slowly and may exceed the API limit. Compress the PDF or split the job before sending.

**Personal data in stored files.** The copies we capture often contain employee or customer data. Define a retention period, delete automatically, and restrict who can access the spool directory.

**A retry causes a duplicate print.** If the worker dies after sending the print but before recording the result, the retry may print again. Record the Epson Connect job id immediately after creating it, and on retry check the status of the existing job before creating a new one. This is the same principle I use for webhooks in [Making webhooks reliable in Laravel](/en/blog/laravel-webhook-recovery-jobs).

## The rollout order I recommend

Do not enable every printer at once. I started with a single printer near the IT team and had a small group of users try it for real for one to two weeks. I collected the problems, such as wrong paper size, cropped margins, and special characters rendering incorrectly, and then expanded one location at a time. Throughout, the old way, downloading the PDF and printing it yourself, kept working, so that if cloud printing had problems, front-line work would not stop.

## Minimum monitoring

- Number of jobs stuck in the queue longer than a set time
- Failure rate per printer (which printers fail often)
- Disk usage of the spool directory
- Token refresh failures

## Summary

A cloud printing setup that works in practice merges every print path into one queue, uses the Epson Connect API as the destination, and uses a CUPS backend to capture jobs from legacy programs that cannot be changed. The parts to watch are not in the API but in permissions, file formats, status polling, preventing duplicate prints on retry, and handling the personal data in the stored copies.
