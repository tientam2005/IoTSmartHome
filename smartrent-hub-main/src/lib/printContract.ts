import { type Contract } from "@/data/mockData";
import { getBuildings, getTenants } from "@/data/buildingStore";
import { formatCurrency } from "@/data/mockData";

const toWords = (n: number) =>
  new Intl.NumberFormat("vi-VN").format(n) + " đồng";

export const printContract = (contract: Contract) => {
  const building = getBuildings().find(b => b.id === contract.buildingId);
  const tenant = getTenants().find(t => t.id === contract.tenantId);

  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  const blank = (len = 30) => `<span style="display:inline-block;min-width:${len}px;border-bottom:1px solid #000;">&nbsp;</span>`;

  const feeLines = [
    `Tiền điện: <strong>${formatCurrency(contract.feeConfig.electricPrice)}/kWh</strong> tính theo chỉ số công tơ, thanh toán vào cuối các tháng.`,
    `Tiền nước: <strong>${formatCurrency(contract.feeConfig.waterPrice)}/m³</strong> thanh toán vào đầu các tháng.`,
    ...(contract.feeConfig.garbageFee ? [`Phí thu gom rác: <strong>${formatCurrency(contract.feeConfig.garbageFee)}/tháng</strong>.`] : []),
    ...(contract.feeConfig.wifiFee ? [`Phí Internet (Wi-Fi): <strong>${formatCurrency(contract.feeConfig.wifiFee)}/tháng</strong>.`] : []),
    ...(contract.feeConfig.parkingFee ? [`Phí giữ xe: <strong>${formatCurrency(contract.feeConfig.parkingFee)}/tháng</strong>.`] : []),
    ...(contract.feeConfig.serviceFee ? [`Phí dịch vụ: <strong>${formatCurrency(contract.feeConfig.serviceFee)}/tháng</strong>.`] : []),
  ];

  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8"/>
<title>Hợp đồng thuê phòng — ${contract.roomName}</title>
<style>
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  @page {
    size: A4 portrait;
    margin: 20mm 20mm 20mm 30mm;
  }

  body {
    font-family: "Times New Roman", Times, serif;
    font-size: 13pt;
    line-height: 1.6;
    color: #000;
    padding: 20mm 20mm 20mm 30mm;
    max-width: 210mm;
    margin: 0 auto;
    background: #fff;
  }

  .center { text-align: center; }
  .bold { font-weight: bold; }
  .upper { text-transform: uppercase; }
  .underline { text-decoration: underline; }

  .quochieu {
    font-size: 13pt;
    font-weight: bold;
    text-transform: uppercase;
    text-align: center;
    letter-spacing: 0.5px;
  }
  .tieungu {
    text-align: center;
    font-size: 13pt;
    margin-top: 2pt;
  }
  .tieungu span {
    border-bottom: 1px solid #000;
    padding-bottom: 1pt;
  }

  .contract-title {
    text-align: center;
    font-size: 15pt;
    font-weight: bold;
    text-transform: uppercase;
    margin: 20pt 0 6pt;
    letter-spacing: 1px;
  }

  .intro {
    margin: 14pt 0 10pt;
    text-align: justify;
  }

  .party-title {
    font-weight: bold;
    margin: 12pt 0 4pt;
  }

  .party-line {
    margin-bottom: 5pt;
    text-align: justify;
  }

  .section-title {
    font-weight: bold;
    text-transform: uppercase;
    text-align: center;
    margin: 18pt 0 8pt;
    font-size: 13pt;
  }

  .bullet {
    font-weight: bold;
    margin: 10pt 0 4pt;
  }

  .item {
    padding-left: 1em;
    margin-bottom: 4pt;
    text-align: justify;
  }

  .content-line {
    margin-bottom: 6pt;
    text-align: justify;
  }

  .sign-section {
    display: flex;
    justify-content: space-between;
    margin-top: 40pt;
    page-break-inside: avoid;
  }
  .sign-box {
    width: 44%;
    text-align: center;
  }
  .sign-box .sign-title {
    font-weight: bold;
    font-size: 13pt;
    text-transform: uppercase;
  }
  .sign-box .sign-note {
    font-style: italic;
    font-size: 11pt;
    margin-top: 2pt;
  }
  .sign-box .sign-space { height: 70pt; }
  .sign-box .sign-name {
    font-size: 13pt;
    font-weight: bold;
  }

  @media print {
    body { padding: 0; }
  }
</style>
</head>
<body>

<p class="quochieu">Cộng hòa xã hội chủ nghĩa Việt Nam</p>
<p class="tieungu"><span>Độc lập – Tự do – Hạnh phúc</span></p>

<p class="contract-title">Hợp đồng thuê phòng trọ</p>

<p class="intro">
  Hôm nay ngày <strong>${day}</strong> tháng <strong>${month}</strong> năm <strong>${year}</strong>;
  tại địa chỉ: <strong>${building?.address ?? blank(200)}</strong>
</p>

<p class="intro">Chúng tôi gồm:</p>

<p class="party-title">1. Đại diện bên cho thuê phòng trọ (Bên A):</p>
<p class="party-line">Ông/bà: ${blank(220)} &nbsp;&nbsp; Sinh ngày: ${blank(100)}</p>
<p class="party-line">Nơi đăng ký HK: ${blank(350)}</p>
<p class="party-line">CMND số: ${blank(120)} cấp ngày ${blank(60)} tại: ${blank(120)}</p>
<p class="party-line">Số điện thoại: ${blank(200)}</p>

<p class="party-title">2. Bên thuê phòng trọ (Bên B):</p>
<p class="party-line">Ông/bà: <strong>${tenant?.name ?? blank(180)}</strong> &nbsp;&nbsp; Sinh ngày: ${blank(100)}</p>
<p class="party-line">Nơi đăng ký HK thường trú: <strong>${tenant?.hometown ?? blank(250)}</strong></p>
<p class="party-line">Số CMND: <strong>${tenant?.cccd ?? blank(120)}</strong> cấp ngày ${blank(60)} tại: ${blank(120)}</p>
<p class="party-line">Số điện thoại: <strong>${tenant?.phone ?? blank(150)}</strong></p>

<p class="intro" style="margin-top:14pt;">
  Sau khi bàn bạc trên tinh thần dân chủ, hai bên cùng có lợi, cùng thống nhất như sau:
</p>

<p class="content-line">
  Bên A đồng ý cho bên B thuê 01 phòng ở tại địa chỉ:
  <strong>${contract.roomName} — ${building?.name ?? ""}, ${building?.address ?? ""}</strong>
</p>

<p class="content-line">Giá thuê: <strong>${formatCurrency(contract.monthlyRent)}/tháng</strong> (${toWords(contract.monthlyRent)})</p>
<p class="content-line">Hình thức thanh toán: Tiền mặt hoặc chuyển khoản ngân hàng, thanh toán trước ngày 05 hàng tháng.</p>

${feeLines.map(l => `<p class="content-line">${l}</p>`).join("")}

<p class="content-line">Tiền đặt cọc: <strong>${formatCurrency(contract.deposit)}</strong> (${toWords(contract.deposit)})</p>

<p class="content-line">
  Hợp đồng có giá trị kể từ ngày <strong>${contract.startDate}</strong> đến ngày <strong>${contract.endDate}</strong>.
</p>

<p class="section-title">Trách nhiệm của các bên</p>

<p class="bullet">* Trách nhiệm của bên A:</p>
<p class="item">- Tạo mọi điều kiện thuận lợi để bên B thực hiện theo hợp đồng.</p>
<p class="item">- Cung cấp nguồn điện, nước, wifi cho bên B sử dụng.</p>

<p class="bullet">* Trách nhiệm của bên B:</p>
<p class="item">- Thanh toán đầy đủ các khoản tiền theo đúng thỏa thuận.</p>
<p class="item">- Bảo quản các trang thiết bị và cơ sở vật chất của bên A trang bị cho ban đầu (làm hỏng phải sửa, mất phải đền).</p>
<p class="item">- Không được tự ý sửa chữa, cải tạo cơ sở vật chất khi chưa được sự đồng ý của bên A.</p>
<p class="item">- Giữ gìn vệ sinh trong và ngoài khuôn viên của phòng trọ.</p>
<p class="item">- Bên B phải chấp hành mọi quy định của pháp luật Nhà nước và quy định của địa phương.</p>
<p class="item">- Nếu bên B cho khách ở qua đêm thì phải báo và được sự đồng ý của chủ nhà đồng thời phải chịu trách nhiệm về các hành vi vi phạm pháp luật của khách trong thời gian ở lại.</p>

<p class="section-title">Trách nhiệm chung</p>

<p class="item">- Hai bên phải tạo điều kiện cho nhau thực hiện hợp đồng.</p>
<p class="item">- Trong thời gian hợp đồng còn hiệu lực nếu bên nào vi phạm các điều khoản đã thỏa thuận thì bên còn lại có quyền đơn phương chấm dứt hợp đồng; nếu sự vi phạm hợp đồng đó gây tổn thất cho bên bị vi phạm hợp đồng thì bên vi phạm hợp đồng phải bồi thường thiệt hại.</p>
<p class="item">- Một trong hai bên muốn chấm dứt hợp đồng trước thời hạn thì phải báo trước cho bên kia ít nhất 30 ngày và hai bên phải có sự thống nhất.</p>
<p class="item">- Bên A phải trả lại tiền đặt cọc cho bên B.</p>
<p class="item">- Bên nào vi phạm điều khoản chung thì phải chịu trách nhiệm trước pháp luật.</p>
<p class="item">- Hợp đồng được lập thành 02 bản có giá trị pháp lý như nhau, mỗi bên giữ một bản.</p>

<div class="sign-section">
  <div class="sign-box">
    <p class="sign-title">Đại diện bên B</p>
    <p class="sign-note">(Ký, ghi rõ họ tên)</p>
    <div class="sign-space"></div>
    <p class="sign-name">${tenant?.name ?? ""}</p>
  </div>
  <div class="sign-box">
    <p class="sign-title">Đại diện bên A</p>
    <p class="sign-note">(Ký, ghi rõ họ tên)</p>
    <div class="sign-space"></div>
    <p class="sign-name">&nbsp;</p>
  </div>
</div>

</body>
</html>`;

  const win = window.open("", "_blank", "width=900,height=750");
  if (!win) { alert("Vui lòng cho phép popup để xuất hợp đồng"); return; }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 800);
};
