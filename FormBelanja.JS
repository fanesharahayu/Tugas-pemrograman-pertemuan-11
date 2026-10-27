// Suku bunga per tahun (%) tiap bank
const BUNGA_BANK = {
  BCA: 5.5,
  BNI: 7,
  CIMB: 6.75
};

const el = (id) => document.getElementById(id);

const form = el("formBelanja");
const metode = el("metode");
const bank = el("bank");
const blokKredit = el("blokKredit");
const hasil = el("hasil");

const rupiah = (angka) =>
  "Rp " + Math.round(angka).toLocaleString("id-ID");

// Hitung ulang semua nilai turunan
function hitung() {
  const jlh = parseFloat(el("jlh").value) || 0;
  const harga = parseFloat(el("harga").value) || 0;
  const total = jlh * harga;

  if (metode.value === "T") {
    // Tunai: bayar penuh
    el("tunai").value = total ? rupiah(total) : "";
    el("saldo").value = "";
    el("bunga").value = "";
    el("pokok").value = "";
    return;
  }

  // Kredit
  el("tunai").value = "";
  const tenor = parseFloat(el("tenor").value) || 0;
  const dp = parseFloat(el("dp").value) || 0;
  const persenBunga = BUNGA_BANK[bank.value] || 0;

  const saldo = Math.max(total - dp, 0);
  // Bunga flat: saldo x bunga per tahun x (tenor / 12)
  const bunga = saldo * (persenBunga / 100) * (tenor / 12);
  const pokokCicilan = tenor ? (saldo + bunga) / tenor : 0;

  el("saldo").value = total ? rupiah(saldo) : "";
  el("bunga").value = saldo && tenor && persenBunga ? rupiah(bunga) : "";
  el("pokok").value = pokokCicilan ? rupiah(pokokCicilan) + " / bulan" : "";
}

// Aktif/nonaktifkan bagian kredit sesuai metode bayar
function ubahMetode() {
  const kredit = metode.value === "K";
  bank.disabled = !kredit;
  blokKredit.disabled = !kredit;
  if (!kredit) bank.value = "";
  hitung();
}

// Event
metode.addEventListener("change", ubahMetode);
["jlh", "harga", "tenor", "dp"].forEach((id) =>
  el(id).addEventListener("input", hitung)
);
bank.addEventListener("change", hitung);

form.addEventListener("reset", () => {
  hasil.hidden = true;
  setTimeout(ubahMetode, 0);
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const kosong = [];
  if (!el("customer").value.trim()) kosong.push("Customer");
  if (!el("dd").value || !el("mm").value || !el("yyyy").value) kosong.push("Tanggal");
  if (!el("jenis").value) kosong.push("Jenis");
  if (!el("harga").value) kosong.push("Harga");
  if (metode.value === "K") {
    if (!bank.value) kosong.push("Bank");
    if (!el("tenor").value) kosong.push("Tenor");
  }

  if (kosong.length) {
    alert("Lengkapi dulu: " + kosong.join(", "));
    return;
  }

  const tgl = [
    el("dd").value.padStart(2, "0"),
    el("mm").value.padStart(2, "0"),
    el("yyyy").value
  ].join("-");

  let teks =
    "Customer      : " + el("customer").value + "\n" +
    "Tanggal       : " + tgl + "\n" +
    "Jenis         : " + el("jenis").value + "\n" +
    "Jumlah        : " + el("jlh").value + " unit\n" +
    "Harga         : " + rupiah(el("harga").value) + "\n" +
    "Metode Bayar  : " + (metode.value === "T" ? "Tunai" : "Kredit") + "\n";

  if (metode.value === "T") {
    teks += "Tunai         : " + el("tunai").value;
  } else {
    teks +=
      "Bank          : " + bank.value + " (" + BUNGA_BANK[bank.value] + "%/thn)\n" +
      "Tenor         : " + el("tenor").value + " bulan\n" +
      "DP            : " + rupiah(el("dp").value || 0) + "\n" +
      "Saldo         : " + el("saldo").value + "\n" +
      "Bunga         : " + el("bunga").value + "\n" +
      "Pokok Cicilan : " + el("pokok").value;
  }

  hasil.textContent = teks;
  hasil.hidden = false;
});

ubahMetode();