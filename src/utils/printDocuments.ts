import type { Order } from '../types';

/**
 * พิมพ์ใบเสร็จรับเงิน / ใบสรุปคำสั่งซื้อดิจิทัล (SORA PINK Digital Receipt)
 */
export const printOrderReceipt = (order: Order): void => {
  const win = window.open('', '_blank', 'width=820,height=920');
  if (!win) {
    alert('กรุณาอนุญาตป๊อปอัป (Pop-up) เพื่อเปิดหน้าพิมพ์ใบเสร็จค่ะ');
    return;
  }

  const createdDate = new Date(order.created_at).toLocaleString('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const subtotalBeforeDiscount = order.total_amount + (order.discount_amount || 0) - (order.shipping_fee || 0);
  const hasFreeSponge = subtotalBeforeDiscount >= 800;
  const hasFreePouch = subtotalBeforeDiscount >= 1200;

  const itemsHtml = (order.items || [])
    .map(
      (item, idx) => `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #FCE7F3; text-align: center;">${idx + 1}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #FCE7F3; font-weight: 600;">
          ${item.product?.name || `รหัสสินค้า ${item.product_id}`}
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #FCE7F3; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #FCE7F3; text-align: right;">฿${item.price_at_purchase.toLocaleString()}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #FCE7F3; text-align: right; font-weight: 700;">฿${(item.price_at_purchase * item.quantity).toLocaleString()}</td>
      </tr>
    `
    )
    .join('');

  const giftsHtml = [
    hasFreeSponge
      ? `<tr style="background: #FFF5F8;">
          <td style="padding: 8px 12px; border-bottom: 1px solid #FCE7F3; text-align: center;">🎁</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #FCE7F3; color: #C73D62; font-weight: 600;">[ของขวัญแถมฟรี] ฟองน้ำมาร์ชแมลโลว์ Sora Pink Puff (เมื่อช้อปครบ ฿800)</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #FCE7F3; text-align: center;">1</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #FCE7F3; text-align: right;">฿0</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #FCE7F3; text-align: right; color: #059669; font-weight: 700;">ฟรี</td>
        </tr>`
      : '',
    hasFreePouch
      ? `<tr style="background: #FFF5F8;">
          <td style="padding: 8px 12px; border-bottom: 1px solid #FCE7F3; text-align: center;">🎁</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #FCE7F3; color: #C73D62; font-weight: 600;">[ของขวัญแถมฟรี] กระเป๋าเครื่องสำอาง Sora Pink Atelier Pouch (เมื่อช้อปครบ ฿1,200)</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #FCE7F3; text-align: center;">1</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #FCE7F3; text-align: right;">฿0</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #FCE7F3; text-align: right; color: #059669; font-weight: 700;">ฟรี</td>
        </tr>`
      : '',
  ].join('');

  const statusText =
    order.order_status === 'cancelled'
      ? 'ยกเลิกคำสั่งซื้อ'
      : order.order_status === 'pending'
      ? 'รอแอดมินตรวจสอบและยืนยัน'
      : order.order_status === 'processing'
      ? 'ยืนยันแล้ว - กำลังจัดเตรียมสินค้า'
      : order.order_status === 'shipped'
      ? 'จัดส่งแล้ว'
      : 'จัดส่งสำเร็จ';

  const html = `
    <!DOCTYPE html>
    <html lang="th">
    <head>
      <meta charset="UTF-8" />
      <title>ใบสรุปคำสั่งซื้อ ${order.id} - SORA PINK</title>
      <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Prompt', sans-serif;
          color: #2C2224;
          background: #FFF9FB;
          margin: 0;
          padding: 32px;
        }
        .receipt-card {
          max-width: 720px;
          margin: 0 auto;
          background: #FFFFFF;
          border-radius: 24px;
          border: 2px solid #FAD1DC;
          padding: 36px;
          box-shadow: 0 12px 32px rgba(223, 94, 126, 0.08);
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px dashed #FAD1DC;
          padding-bottom: 20px;
          margin-bottom: 24px;
        }
        .brand-title {
          font-size: 26px;
          font-weight: 700;
          color: #C73D62;
          margin: 0;
          letter-spacing: 0.04em;
        }
        .badge {
          display: inline-block;
          padding: 4px 14px;
          border-radius: 9999px;
          background: #FFF0F4;
          color: #C73D62;
          border: 1px solid #FAD1DC;
          font-size: 13px;
          font-weight: 600;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          font-size: 14px;
        }
        th {
          background: #FFF0F4;
          color: #9D174D;
          padding: 10px 12px;
          text-align: left;
          font-weight: 600;
        }
        .print-btn {
          background: linear-gradient(135deg, #DF5E7E 0%, #C73D62 100%);
          color: #FFFFFF;
          border: none;
          border-radius: 9999px;
          padding: 10px 24px;
          font-family: 'Prompt', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }
        @media print {
          body { background: #FFFFFF; padding: 0; }
          .no-print { display: none !important; }
          .receipt-card { box-shadow: none; border: 1px solid #E5E7EB; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="max-width: 720px; margin: 0 auto 16px auto; text-align: right;">
        <button class="print-btn" onclick="window.print()">🖨️ พิมพ์ใบเสร็จ / บันทึกเป็น PDF</button>
      </div>
      <div class="receipt-card">
        <div class="header">
          <div>
            <h1 class="brand-title">SORA PINK</h1>
            <div style="font-size: 13px; color: #706064; margin-top: 4px;">
              SORA PINK OFFICIAL STORE (โซระ พิ้งค์ สกินแคร์ & คอสเมติกส์)<br/>
              ใบสรุปคำสั่งซื้อ / ใบเสร็จรับเงินดิจิทัล (Official Order Receipt)
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 18px; font-weight: 700; color: #0284C7;">#${order.id}</div>
            <div style="font-size: 13px; color: #706064; margin: 4px 0;">วันที่: ${createdDate}</div>
            <span class="badge">${statusText}</span>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: #FFF9FB; padding: 16px; border-radius: 16px; border: 1px solid #FCE7F3; font-size: 13.5px;">
          <div>
            <div style="font-weight: 700; color: #C73D62; margin-bottom: 4px;">ข้อมูลลูกค้า & ที่อยู่จัดส่ง:</div>
            <div><strong>ชื่อผู้รับ:</strong> ${order.shipping_address.fullName}</div>
            <div><strong>โทรศัพท์:</strong> ${order.shipping_address.phone}</div>
            <div><strong>ที่อยู่:</strong> ${order.shipping_address.address} จ.${order.shipping_address.province} ${order.shipping_address.postalCode}</div>
          </div>
          <div>
            <div style="font-weight: 700; color: #C73D62; margin-bottom: 4px;">รายละเอียดการชำระเงิน:</div>
            <div><strong>วิธีชำระเงิน:</strong> ${order.payment_method.toUpperCase()}</div>
            <div><strong>การยืนยันจากแอดมิน:</strong> ${order.admin_verified ? '✅ ตรวจสอบและอนุมัติแล้ว' : '⏳ รอแอดมินตรวจสอบ'}</div>
            <div><strong>เลขพัสดุ:</strong> ${order.tracking_number || 'รอดำเนินการจัดส่ง'}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 45px; text-align: center; border-radius: 10px 0 0 10px;">ลำดับ</th>
              <th>รายการสินค้า</th>
              <th style="width: 70px; text-align: center;">จำนวน</th>
              <th style="width: 100px; text-align: right;">ราคา/ชิ้น</th>
              <th style="width: 110px; text-align: right; border-radius: 0 10px 10px 0;">รวม</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
            ${giftsHtml}
          </tbody>
        </table>

        <div style="display: flex; justify-content: flex-end; margin-top: 16px;">
          <div style="width: 280px; font-size: 14px;">
            <div style="display: flex; justify-content: space-between; padding: 4px 0;">
              <span style="color: #706064;">ยอดรวมสินค้า:</span>
              <strong>฿${subtotalBeforeDiscount.toLocaleString()}</strong>
            </div>
            ${
              order.discount_amount > 0
                ? `<div style="display: flex; justify-content: space-between; padding: 4px 0; color: #C73D62;">
                    <span>ส่วนลดคูปอง:</span>
                    <strong>-฿${order.discount_amount.toLocaleString()}</strong>
                  </div>`
                : ''
            }
            <div style="display: flex; justify-content: space-between; padding: 4px 0;">
              <span style="color: #706064;">ค่าจัดส่ง:</span>
              <strong>${order.shipping_fee === 0 ? 'ฟรี (฿0)' : `฿${order.shipping_fee.toLocaleString()}`}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 10px 0; margin-top: 6px; border-top: 2px solid #FAD1DC; font-size: 18px; font-weight: 700; color: #C73D62;">
              <span>ยอดสุทธิทั้งสิ้น:</span>
              <span>฿${order.total_amount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div style="margin-top: 28px; text-align: center; font-size: 12.5px; color: #8F8881; border-top: 1px dashed #FAD1DC; padding-top: 16px;">
          ขอบคุณที่ไว้วางใจผลิตภัณฑ์ดูแลผิว SORA PINK 💖 สินค้าทุกชิ้นรับประกันของแท้ 100%
        </div>
      </div>
    </body>
    </html>
  `;

  win.document.open();
  win.document.write(html);
  win.document.close();
};

/**
 * พิมพ์ใบปะหน้าพัสดุสำหรับแอดมินแปะกล่องจัดส่ง (Shipping Label + Packing List)
 */
export const printShippingLabel = (order: Order): void => {
  const win = window.open('', '_blank', 'width=760,height=880');
  if (!win) {
    alert('กรุณาอนุญาตป๊อปอัป (Pop-up) เพื่อเปิดหน้าพิมพ์ใบปะหน้าพัสดุค่ะ');
    return;
  }

  const isCOD = order.payment_method === 'cod';
  const subtotalBeforeDiscount = order.total_amount + (order.discount_amount || 0) - (order.shipping_fee || 0);
  const hasFreeSponge = subtotalBeforeDiscount >= 800;
  const hasFreePouch = subtotalBeforeDiscount >= 1200;

  const packItemsHtml = (order.items || [])
    .map(
      (item, idx) => `
      <tr>
        <td style="padding: 6px 8px; border: 1px solid #CBD5E1; text-align: center;">${idx + 1}</td>
        <td style="padding: 6px 8px; border: 1px solid #CBD5E1; font-weight: 600;">${item.product?.name || item.product_id}</td>
        <td style="padding: 6px 8px; border: 1px solid #CBD5E1; text-align: center; font-size: 16px; font-weight: 700;">${item.quantity}</td>
      </tr>
    `
    )
    .join('');

  const packGiftsHtml = [
    hasFreeSponge
      ? `<tr>
          <td style="padding: 6px 8px; border: 1px solid #CBD5E1; text-align: center;">🎁</td>
          <td style="padding: 6px 8px; border: 1px solid #CBD5E1; font-weight: 600;">[ของแถมครบ ฿800] ฟองน้ำแต่งหน้ามาร์ชแมลโลว์ Sora Pink</td>
          <td style="padding: 6px 8px; border: 1px solid #CBD5E1; text-align: center; font-weight: 700;">1</td>
        </tr>`
      : '',
    hasFreePouch
      ? `<tr>
          <td style="padding: 6px 8px; border: 1px solid #CBD5E1; text-align: center;">🎁</td>
          <td style="padding: 6px 8px; border: 1px solid #CBD5E1; font-weight: 600;">[ของแถมครบ ฿1,200] กระเป๋าเครื่องสำอาง Sora Pink Atelier Pouch</td>
          <td style="padding: 6px 8px; border: 1px solid #CBD5E1; text-align: center; font-weight: 700;">1</td>
        </tr>`
      : '',
  ].join('');

  const html = `
    <!DOCTYPE html>
    <html lang="th">
    <head>
      <meta charset="UTF-8" />
      <title>ใบปะหน้าพัสดุ ${order.id} - SORA PINK</title>
      <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@400;600;700&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Prompt', sans-serif;
          margin: 0;
          padding: 24px;
          background: #F1F5F9;
          color: #0F172A;
        }
        .label-box {
          max-width: 560px;
          margin: 0 auto;
          background: #FFFFFF;
          border: 3px solid #0F172A;
          border-radius: 12px;
          padding: 24px;
        }
        .cod-banner {
          margin: 16px 0;
          padding: 14px;
          border: 3px solid #0F172A;
          text-align: center;
          background: ${isCOD ? '#FEF3C7' : '#F0FDF4'};
        }
        @media print {
          body { background: #FFFFFF; padding: 0; }
          .no-print { display: none !important; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="max-width: 560px; margin: 0 auto 14px auto; text-align: right;">
        <button onclick="window.print()" style="background: #C73D62; color: #FFF; border: none; padding: 10px 22px; border-radius: 9999px; font-family: 'Prompt', sans-serif; font-weight: 700; cursor: pointer;">
          🖨️ สั่งพิมพ์ใบปะหน้าพัสดุ (Print Label)
        </button>
      </div>
      <div class="label-box">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0F172A; padding-bottom: 12px;">
          <div>
            <div style="font-size: 22px; font-weight: 700; color: #C73D62;">SORA PINK EXPRESS</div>
            <div style="font-size: 12px;">ผู้ส่ง: SORA PINK OFFICIAL STORE (โทร: 095-991-9679)</div>
            <div style="font-size: 12px;">กรุงเทพมหานคร 10110</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 13px; font-weight: 700;">ORDER: ${order.id}</div>
            <div style="font-size: 12px;">TRACKING: ${order.tracking_number || '________________'}</div>
          </div>
        </div>

        <div style="padding: 18px 0; border-bottom: 2px dashed #0F172A;">
          <div style="font-size: 13px; font-weight: 700; color: #475569; margin-bottom: 4px;">กรุณาส่ง (ผู้รับ / RECIPIENT):</div>
          <div style="font-size: 22px; font-weight: 700;">${order.shipping_address.fullName}</div>
          <div style="font-size: 18px; font-weight: 700; color: #C73D62; margin: 4px 0;">โทร: ${order.shipping_address.phone}</div>
          <div style="font-size: 16px; line-height: 1.5; margin-top: 6px;">
            ${order.shipping_address.address}<br/>
            จังหวัด <strong>${order.shipping_address.province}</strong>
          </div>
          <div style="margin-top: 10px; display: inline-block; border: 2px solid #0F172A; padding: 4px 16px; font-size: 22px; font-weight: 700; letter-spacing: 3px;">
            ${order.shipping_address.postalCode}
          </div>
          ${
            order.shipping_address.note
              ? `<div style="margin-top: 8px; font-size: 13px; background: #F8FAFC; padding: 6px 10px; border-left: 3px solid #C73D62;">หมายเหตุถึงขนส่ง: ${order.shipping_address.note}</div>`
              : ''
          }
        </div>

        <div class="cod-banner">
          ${
            isCOD
              ? `<div style="font-size: 14px; font-weight: 700;">เก็บเงินปลายทาง (COD)</div>
                 <div style="font-size: 26px; font-weight: 700; color: #B45309;">฿${order.total_amount.toLocaleString()} บาท</div>`
              : `<div style="font-size: 18px; font-weight: 700; color: #059669;">ไม่ต้องเก็บเงิน (ชำระเงินแล้ว - PAID)</div>`
          }
        </div>

        <div>
          <div style="font-size: 13px; font-weight: 700; margin-bottom: 6px;">รายการแพ็คสินค้าลงกล่อง (Packing Slip):</div>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="background: #F1F5F9;">
                <th style="padding: 6px; border: 1px solid #CBD5E1; width: 36px;">#</th>
                <th style="padding: 6px; border: 1px solid #CBD5E1; text-align: left;">ชื่อสินค้า</th>
                <th style="padding: 6px; border: 1px solid #CBD5E1; width: 65px;">จำนวน</th>
              </tr>
            </thead>
            <tbody>
              ${packItemsHtml}
              ${packGiftsHtml}
            </tbody>
          </table>
        </div>
      </div>
    </body>
    </html>
  `;

  win.document.open();
  win.document.write(html);
  win.document.close();
};

/**
 * ส่งออกข้อมูลคำสั่งซื้อทั้งหมดเป็นไฟล์ CSV (รองรับภาษาไทยใน Microsoft Excel)
 */
export const exportOrdersToCSV = (orders: Order[]): void => {
  const headers = [
    'หมายเลขคำสั่งซื้อ',
    'วันที่สั่งซื้อ',
    'ชื่อผู้รับ',
    'เบอร์โทรศัพท์',
    'ที่อยู่จัดส่ง',
    'จังหวัด',
    'รหัสไปรษณีย์',
    'ช่องทางชำระเงิน',
    'สถานะออเดอร์',
    'แอดมินยืนยันแล้ว',
    'เลขพัสดุ',
    'ส่วนลด (บาท)',
    'ค่าส่ง (บาท)',
    'ยอดสุทธิ (บาท)',
    'รายการสินค้า',
  ];

  const escapeCsv = (val: string | number | boolean | null | undefined) => {
    const str = String(val ?? '').replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = orders.map((o) => {
    const itemsText = (o.items || [])
      .map((i) => `${i.product?.name || i.product_id} (x${i.quantity})`)
      .join(' | ');
    return [
      o.id,
      new Date(o.created_at).toLocaleString('th-TH'),
      o.shipping_address.fullName,
      o.shipping_address.phone,
      o.shipping_address.address,
      o.shipping_address.province,
      o.shipping_address.postalCode,
      o.payment_method,
      o.order_status,
      o.admin_verified ? 'ยืนยันแล้ว' : 'รอตรวจสอบ',
      o.tracking_number || '-',
      o.discount_amount || 0,
      o.shipping_fee || 0,
      o.total_amount,
      itemsText,
    ]
      .map(escapeCsv)
      .join(',');
  });

  // Prepend UTF-8 BOM (\uFEFF) so Excel on Windows reads Thai characters properly
  const csvContent = '\uFEFF' + [headers.map(escapeCsv).join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const datePart = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.setAttribute('download', `sora-pink-orders-${datePart}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
