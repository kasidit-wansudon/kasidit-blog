'use client';

import { useState } from 'react';

function buildWorkflowOutput(query: string) {
  const q = query.trim();
  const lines: string[] = [];

  lines.push(`เริ่ม workflow: ${q || '(ไม่มีคำค้น)'}\n`);

  lines.push('[1] gdrive.search: ค้นหาเอกสาร/โฟลเดอร์จากคำค้น');
  lines.push(`    query = '${q}'`);
  lines.push('    -> (ตัวอย่าง) ได้ไฟล์ที่เกี่ยวข้อง + gdrive:///... URI');

  lines.push('');
  lines.push('[2] memory: บันทึกว่าไฟล์นี้คือแหล่งข้อมูลหลัก');
  lines.push("    remember(key='primary_doc', value='gdrive:///...')");

  lines.push('');
  lines.push('[3] brave-search: หาอ้างอิงภายนอก/วิธีทำงาน/แนวปฏิบัติ');
  lines.push(`    web_search('${q ? `${q} best practices` : 'best practices'}')`);
  lines.push('    -> (หมายเหตุ) ถ้า local_search โดน rate limit ให้ใช้ web_search แทน');

  lines.push('');
  lines.push('[4] deepwiki: ถ้าต้องอ่านโครงสร้าง repo เพื่อทำความเข้าใจระบบ');
  lines.push("    read_wiki_structure(repo='facebook/react') (ตัวอย่าง)\n");

  lines.push('[5] สรุปผล: ส่งชื่อไฟล์/ลิงก์/ข้อเสนอแนะที่อ้างอิงได้ให้ทีม');

  return lines.join('\n');
}

export default function McpOverview() {
  const defaultQuery = 'MEX leave approve flow';
  const [query, setQuery] = useState(defaultQuery);
  const [output, setOutput] = useState(() => buildWorkflowOutput(defaultQuery));

  const run = () => {
    setOutput(buildWorkflowOutput(query));
  };

  const reset = () => {
    setOutput('');
  };

  return (
    <div className="mcp-wrap">
      <header className="mcp-header">
        <div className="mcp-inner">
          <div className="mcp-h1">
            MCP (Model Context Protocol) — สรุปข้อดี/ข้อเสีย + ตัวอย่างการทำงานร่วมกัน
          </div>
          <div className="mcp-sub">
            ครอบคลุม MCP ที่มีในเครื่องคุณตอนนี้: <b>gdrive</b>, <b>brave-search</b>,{' '}
            <b>deepwiki</b>, <b>memory</b>
          </div>
          <nav className="mcp-nav" aria-label="MCP overview sections">
            <a href="#mcp-overview">ภาพรวม</a>
            <a href="#mcp-proscons">ข้อดี/ข้อเสีย</a>
            <a href="#mcp-collab">ตัวอย่างทำงานร่วมกัน</a>
            <a href="#mcp-notes">ข้อควรระวัง</a>
          </nav>
        </div>
      </header>

      <main className="mcp-main mcp-inner">
        <section id="mcp-overview" className="mcp-section">
          <div className="mcp-grid">
            <div className="mcp-card mcp-span-8">
              <div className="mcp-title-row">
                <h3 className="mcp-h2">ภาพรวม MCP</h3>
                <span className="mcp-pill mcp-pill-good">
                  แนวคิดหลัก: Tooling แบบปลั๊กอิน
                </span>
              </div>
              <div className="mcp-kvs">
                <div className="mcp-kv">
                  <div className="mcp-k">MCP คืออะไร</div>
                  <div className="mcp-v">
                    มาตรฐานการเชื่อม “AI Assistant” กับ “เครื่องมือ/ข้อมูลภายนอก” ผ่านชุด
                    tool ที่เรียกใช้ได้ (เช่น search, drive, wiki, memory)
                  </div>
                </div>
                <div className="mcp-kv">
                  <div className="mcp-k">ทำไมถึงดี</div>
                  <div className="mcp-v">
                    แยกความรับผิดชอบชัดเจน: AI ทำ reasoning/ตัดสินใจ ส่วน MCP ทำงานเฉพาะทาง
                    (ค้นหาไฟล์, ดึงข้อมูล repo, ค้นเว็บ, เก็บความจำ)
                  </div>
                </div>
              </div>
            </div>

            <div className="mcp-card mcp-span-4">
              <div className="mcp-title-row">
                <h3 className="mcp-h2">สถานะจากการทดสอบล่าสุด</h3>
                <span className="mcp-pill mcp-pill-warn">สรุปเร็ว</span>
              </div>
              <ul className="mcp-list">
                <li>
                  <b>gdrive</b>: ใช้งานได้
                </li>
                <li>
                  <b>deepwiki</b>: ใช้งานได้
                </li>
                <li>
                  <b>memory</b>: ใช้งานได้
                </li>
                <li>
                  <b>brave-search</b>: web search ใช้ได้ แต่ local search โดน rate limit
                </li>
              </ul>
              <div className="mcp-divider" />
              <div className="mcp-note">
                หมายเหตุ: บาง server ไม่รองรับ <code>resources</code> เป็นเรื่องปกติ
                (ไม่ได้แปลว่าเสีย)
              </div>
            </div>
          </div>
        </section>

        <section id="mcp-proscons" className="mcp-section">
          <h3 className="mcp-h2">ข้อดี/ข้อเสีย (แยกตาม MCP)</h3>
          <div className="mcp-grid">
            <div className="mcp-card mcp-span-6">
              <div className="mcp-title-row">
                <h4 className="mcp-h3">gdrive</h4>
                <span className="mcp-pill mcp-pill-good">เหมาะกับ “ค้น/อ่านไฟล์งาน”</span>
              </div>
              <div className="mcp-kvs">
                <div className="mcp-kv">
                  <div className="mcp-k">ข้อดี</div>
                  <div className="mcp-v">
                    <ul className="mcp-list">
                      <li>ค้นหาไฟล์/โฟลเดอร์ได้เร็ว (เหมาะกับงานเอกสาร)</li>
                      <li>
                        ได้ตัวระบุ resource (เช่น <code>gdrive:///...</code>) เพื่ออ้างอิงไฟล์
                        ได้แม่น
                      </li>
                      <li>
                        เหมาะกับ workflow: หาไฟล์ → สรุป → แชร์ลิงก์/ชื่อไฟล์ให้ทีม
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mcp-kv">
                  <div className="mcp-k">ข้อเสีย/ข้อจำกัด</div>
                  <div className="mcp-v">
                    <ul className="mcp-list">
                      <li>ต้อง auth ก่อน และสิทธิ์ไฟล์ขึ้นอยู่กับ account ที่ล็อกอิน</li>
                      <li>
                        รูปแบบ query อาจไม่รองรับแบบ Drive API 100% (ควรใช้ query สไตล์
                        search box เช่น <code>type:folder</code>)
                      </li>
                      <li>การไล่ “ไฟล์ในโฟลเดอร์” มักต้องมี folderId/URI ที่ชัดเจน</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="mcp-card mcp-span-6">
              <div className="mcp-title-row">
                <h4 className="mcp-h3">brave-search</h4>
                <span className="mcp-pill mcp-pill-warn">
                  เหมาะกับ “ข้อมูลใหม่/อ้างอิงภายนอก”
                </span>
              </div>
              <div className="mcp-kvs">
                <div className="mcp-kv">
                  <div className="mcp-k">ข้อดี</div>
                  <div className="mcp-v">
                    <ul className="mcp-list">
                      <li>ดึงข้อมูลจากเว็บแบบหลากหลาย เหมาะกับ best practices, ข่าว, docs</li>
                      <li>ช่วยทำ “การอ้างอิง” ให้คำแนะนำมีหลักฐานจากภายนอก</li>
                    </ul>
                  </div>
                </div>
                <div className="mcp-kv">
                  <div className="mcp-k">ข้อเสีย/ข้อจำกัด</div>
                  <div className="mcp-v">
                    <ul className="mcp-list">
                      <li>เสี่ยงโดน rate limit (เจอแล้วใน local search)</li>
                      <li>ผลค้นหาอาจผันผวนตามเวลา/ภูมิภาค</li>
                      <li>ต้องระวังเรื่องข้อมูลส่วนตัว/ความลับขององค์กรเวลาใช้ค้นเว็บ</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="mcp-card mcp-span-6">
              <div className="mcp-title-row">
                <h4 className="mcp-h3">deepwiki</h4>
                <span className="mcp-pill mcp-pill-good">
                  เหมาะกับ “ถามโครงสร้าง repo / ทำความเข้าใจระบบ”
                </span>
              </div>
              <div className="mcp-kvs">
                <div className="mcp-kv">
                  <div className="mcp-k">ข้อดี</div>
                  <div className="mcp-v">
                    <ul className="mcp-list">
                      <li>ตอบคำถามเชิงโครงสร้างของ repo ได้ดี (เช่น architecture / modules)</li>
                      <li>ช่วย onboarding ทีม/ทำความเข้าใจ dependency ได้ไว</li>
                    </ul>
                  </div>
                </div>
                <div className="mcp-kv">
                  <div className="mcp-k">ข้อเสีย/ข้อจำกัด</div>
                  <div className="mcp-v">
                    <ul className="mcp-list">
                      <li>
                        จำกัดเฉพาะ repo ที่รองรับ (โดยมากคือ GitHub) และไม่ใช่ข้อมูล runtime
                        ของระบบคุณ
                      </li>
                      <li>อาจไม่ทัน commit ล่าสุดเสมอ (ขึ้นกับแหล่งข้อมูล)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="mcp-card mcp-span-6">
              <div className="mcp-title-row">
                <h4 className="mcp-h3">memory</h4>
                <span className="mcp-pill mcp-pill-good">
                  เหมาะกับ “เก็บบริบทระยะยาว/กติกาโปรเจกต์”
                </span>
              </div>
              <div className="mcp-kvs">
                <div className="mcp-kv">
                  <div className="mcp-k">ข้อดี</div>
                  <div className="mcp-v">
                    <ul className="mcp-list">
                      <li>เก็บความรู้ที่ใช้ซ้ำได้ เช่น business rules, flow, mapping, checklist</li>
                      <li>ลดการถามซ้ำ/ลดโอกาสทำผิดมาตรฐานทีม</li>
                    </ul>
                  </div>
                </div>
                <div className="mcp-kv">
                  <div className="mcp-k">ข้อเสีย/ข้อจำกัด</div>
                  <div className="mcp-v">
                    <ul className="mcp-list">
                      <li>
                        ถ้าไม่ดูแล อาจ “เก่า/ผิด” ได้ ต้องมีการ update/ลบเมื่อ rule เปลี่ยน
                      </li>
                      <li>ควรหลีกเลี่ยงการเก็บความลับสำคัญลง memory ถ้าไม่จำเป็น</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="mcp-collab" className="mcp-section">
          <h3 className="mcp-h2">ตัวอย่างการทำงานร่วมกัน (Workflow Demo)</h3>
          <div className="mcp-grid">
            <div className="mcp-card mcp-span-8">
              <div className="mcp-title-row">
                <h4 className="mcp-h3">
                  Scenario: “หาเอกสารงานใน Drive แล้วหาข้อมูลอ้างอิง + เก็บความจำสำหรับรอบถัดไป”
                </h4>
                <span className="mcp-pill mcp-pill-good">
                  gdrive + brave-search + deepwiki + memory
                </span>
              </div>

              <div className="mcp-demo">
                <div className="mcp-row">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <button type="button" onClick={run}>
                    จำลองการไหลของงาน
                  </button>
                  <button type="button" onClick={reset}>
                    ล้าง
                  </button>
                </div>
                <div className="mcp-note">
                  *เดโมนี้เป็น “ตัวอย่างการทำงานร่วมกัน” แบบอธิบายขั้นตอน (หน้าเว็บไม่ได้เรียก
                  MCP จริงจาก browser)
                </div>
                <pre className="mcp-code" aria-live="polite">
                  {output}
                </pre>
              </div>
            </div>

            <div className="mcp-card mcp-span-4">
              <div className="mcp-title-row">
                <h4 className="mcp-h3">ตัวอย่างผลที่เคยเจอจริง (จากการทดสอบใน session นี้)</h4>
                <span className="mcp-pill mcp-pill-warn">ตัวอย่าง</span>
              </div>
              <pre className="mcp-code">
                {`gdrive resource ตัวอย่าง:
- gdrive:///11oU31ECPqWilxLrbA8yzbU02sSgEU6AI (folk_project_catcare)
- gdrive:///1OJwb1csvqpZzuOjTwpTT-TB8kJb26yrvRwc9KiStw2g (Track MEX leave approve flow)

deepwiki ตัวอย่าง:
- facebook/react: อ่านโครงสร้างเอกสารได้

brave-search ตัวอย่าง:
- web_search: ใช้ได้
- local_search: rate limit exceeded (ต้องรอ/ลดความถี่)`}
              </pre>
            </div>
          </div>

          <div className="mcp-card">
            <h4 className="mcp-h3">Pseudo-calls (มองเป็นท่อเดียวกัน)</h4>
            <pre className="mcp-code">{`1) gdrive: ค้นหาไฟล์งาน
   search("MEX leave approve flow")
   -> ได้ไฟล์ spreadsheet ที่เกี่ยวข้อง + URI

2) memory: จำว่าไฟล์/โฟลเดอร์ไหนคือแหล่งข้อมูลหลัก
   remember({ key: "leave_flow_sheet", value: "gdrive:///..." })

3) brave-search: หา best practice/อ้างอิงภายนอก (ถ้าจำเป็น)
   web_search("dingtalk approval flow best practices")

4) deepwiki: ถ้าต้องอ่านโครงสร้าง repo library หรือ framework
   ask_question(repo="...")

5) สรุปผลให้ทีม/ทำ action ต่อ (เช่น สร้าง PR, ปรับ flow, ทำ checklist)`}</pre>
          </div>
        </section>

        <section id="mcp-notes" className="mcp-section">
          <h3 className="mcp-h2">ข้อควรระวังเวลาใช้หลาย MCP ร่วมกัน</h3>
          <div className="mcp-grid">
            <div className="mcp-card mcp-span-6">
              <h4 className="mcp-h3">การจัดการสิทธิ์/ข้อมูล</h4>
              <ul className="mcp-list">
                <li>อย่าเอาข้อมูลลับ (token/keys/ข้อมูลส่วนบุคคล) ไปค้นเว็บ</li>
                <li>gdrive เห็นได้เท่ากับสิทธิ์ของ account ที่ auth</li>
                <li>memory ควรเก็บเฉพาะ rule/ความรู้ที่จำเป็นและไม่ sensitive</li>
              </ul>
            </div>
            <div className="mcp-card mcp-span-6">
              <h4 className="mcp-h3">ความเสถียร/ข้อจำกัด</h4>
              <ul className="mcp-list">
                <li>
                  brave-search อาจโดน rate limit: ลดความถี่, แคชผล, ใช้ web_search แทน
                  local_search
                </li>
                <li>
                  query ของ gdrive ควรใช้แบบ search box (เช่น <code>type:folder</code>) ถ้าแบบ
                  API ไม่ติด
                </li>
                <li>deepwiki เป็นเอกสาร repo ไม่ใช่ runtime state ของระบบ</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer className="mcp-footer">
        <div className="mcp-inner mcp-small">
          หน้าเอกสารนี้ถูกสร้างเพื่อใช้อธิบาย “ข้อดี/ข้อเสียของ MCP” และ “แนวทางทำงานร่วมกัน”
        </div>
      </footer>

      <style jsx>{`
        .mcp-wrap {
          --bg: #0b1020;
          --card: #121a33;
          --muted: #93a4c7;
          --text: #e8eefc;
          --accent: #7aa7ff;
          --good: #2dd4bf;
          --bad: #fb7185;
          --warn: #fbbf24;
          --border: rgba(255, 255, 255, 0.08);
          --mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
            'Liberation Mono', 'Courier New', monospace;
          --sans: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto,
            Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji';

          color: var(--text);
          background: radial-gradient(
              1200px 800px at 20% -10%,
              rgba(122, 167, 255, 0.25),
              transparent 45%
            ),
            radial-gradient(
              1000px 600px at 90% 10%,
              rgba(45, 212, 191, 0.18),
              transparent 40%
            ),
            var(--bg);
          border: 1px solid rgba(148, 163, 184, 0.18);
          border-radius: 18px;
          overflow: hidden;
        }

        .mcp-inner {
          max-width: 1100px;
          margin: 0 auto;
        }

        .mcp-header {
          padding: 22px 16px 12px;
          border-bottom: 1px solid var(--border);
          backdrop-filter: blur(10px);
          background: rgba(11, 16, 32, 0.6);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .mcp-main {
          padding: 18px 16px;
        }

        .mcp-section {
          margin: 16px 0 26px;
        }

        .mcp-h1 {
          margin: 0;
          font-size: 18px;
          letter-spacing: 0.2px;
          font-family: var(--sans);
        }

        .mcp-h2 {
          margin: 0 0 10px;
          font-size: 16px;
          font-family: var(--sans);
        }

        .mcp-h3 {
          margin: 0 0 10px;
          font-size: 14px;
          color: #d7e3ff;
          font-family: var(--sans);
        }

        .mcp-sub {
          margin-top: 6px;
          color: var(--muted);
          font-size: 13px;
        }

        .mcp-nav {
          margin-top: 14px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .mcp-nav a {
          text-decoration: none;
          color: var(--text);
          padding: 8px 10px;
          border: 1px solid var(--border);
          border-radius: 10px;
          font-size: 13px;
          background: rgba(255, 255, 255, 0.03);
        }

        .mcp-nav a:hover {
          border-color: rgba(122, 167, 255, 0.35);
        }

        .mcp-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 14px;
        }

        .mcp-card {
          grid-column: span 12;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.04),
            rgba(255, 255, 255, 0.02)
          );
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 14px;
        }

        @media (min-width: 900px) {
          .mcp-span-6 {
            grid-column: span 6;
          }
          .mcp-span-8 {
            grid-column: span 8;
          }
          .mcp-span-4 {
            grid-column: span 4;
          }
        }

        .mcp-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .mcp-pill {
          font-size: 12px;
          padding: 4px 8px;
          border-radius: 999px;
          border: 1px solid var(--border);
          color: var(--muted);
          white-space: nowrap;
        }

        .mcp-pill-good {
          color: var(--good);
          border-color: rgba(45, 212, 191, 0.35);
        }

        .mcp-pill-warn {
          color: var(--warn);
          border-color: rgba(251, 191, 36, 0.35);
        }

        .mcp-kvs {
          display: grid;
          gap: 10px;
        }

        .mcp-kv {
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 10px;
          background: rgba(0, 0, 0, 0.12);
        }

        .mcp-k {
          font-weight: 600;
          font-size: 13px;
          font-family: var(--sans);
        }

        .mcp-v {
          color: var(--muted);
          font-size: 13px;
          margin-top: 4px;
        }

        .mcp-list {
          margin: 0;
          padding-left: 18px;
          color: var(--muted);
          font-size: 13px;
        }

        .mcp-list li {
          margin: 6px 0;
        }

        .mcp-code {
          font-family: var(--mono);
          font-size: 12px;
          background: rgba(0, 0, 0, 0.24);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 10px;
          overflow: auto;
          color: #dbe7ff;
          white-space: pre;
          margin: 0;
        }

        .mcp-demo {
          display: grid;
          gap: 12px;
        }

        .mcp-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
        }

        .mcp-row input[type='text'] {
          flex: 1 1 260px;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: rgba(0, 0, 0, 0.18);
          color: var(--text);
          outline: none;
        }

        .mcp-row button {
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid rgba(122, 167, 255, 0.35);
          background: rgba(122, 167, 255, 0.12);
          color: var(--text);
          cursor: pointer;
          font-weight: 600;
        }

        .mcp-row button:hover {
          background: rgba(122, 167, 255, 0.18);
        }

        .mcp-note {
          color: var(--muted);
          font-size: 12px;
        }

        .mcp-divider {
          height: 1px;
          background: var(--border);
          margin: 12px 0;
        }

        .mcp-footer {
          padding: 16px 16px 18px;
          border-top: 1px solid var(--border);
          color: var(--muted);
        }

        .mcp-small {
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}
