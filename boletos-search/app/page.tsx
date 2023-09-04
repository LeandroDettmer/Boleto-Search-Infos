"use client"
import { useState } from 'react'
import utils from './utils/utils';
import extractBoletoInfo from './ts/boletoExtractInfo'

interface boletoInterface { barcode: string, type?: string, dueDate: string, boletoTypeBarcode: string, message: string, sucess: Boolean, amount: number }

export default function SearchBarCode() {
  const [barcodeDigitalLine, setBarcodeDigitalLine] = useState<string>("846600000000564900691002013164028543923076543506");
  const [boletoInfos, setBoletoInfos] = useState<boletoInterface>({ barcode: '', type: '', boletoTypeBarcode: '', dueDate: '', message: '', sucess: false, amount: 0.00 });

  function searchBoletoInfos(barcodeDigitalLine: string) {
    setBoletoDisplay({ barcode: '', type: '', boletoTypeBarcode: '', dueDate: '', message: '', sucess: false, amount: 0.00 });
    const boletoInfosExtracted = extractBoletoInfo(barcodeDigitalLine);
    if (!boletoInfosExtracted?.sucess || !boletoInfosExtracted) return setBoletoDisplay({ barcode: '', type: '', boletoTypeBarcode: '', dueDate: '', message: 'Boleto is not valid!', sucess: false, amount: 0.00 });

    const { barcodeInput, boletoType, boletoTypeInput, dueDate, message, sucess, value } = boletoInfosExtracted
    setBoletoDisplay({ barcode: barcodeInput, type: boletoType, boletoTypeBarcode: boletoTypeInput, dueDate: dueDate, message: message, sucess: sucess, amount: value });
    return boletoInfosExtracted
  }

  function setBoletoDisplay(data: boletoInterface) {
    const { barcode, type, boletoTypeBarcode, dueDate, message, sucess, amount } = data;
    setBoletoInfos({ barcode: barcode, type: type, boletoTypeBarcode: boletoTypeBarcode, dueDate: dueDate, message: message, sucess: sucess, amount: amount });
  }

  return (
    <main style={{ display: "flex", width: "100%", height: "100vh", alignItems: "center", justifyContent: "center", }}>
      <div style={{ textAlign: "center" }}>
        Search BOLETO barcode digital line
        <input
          style={{ borderRadius: 10, color: "black", margin: 10, padding: 10, width: "80%" }}
          value={barcodeDigitalLine}
          defaultValue={barcodeDigitalLine}
          onChange={({ target }) => setBarcodeDigitalLine(target?.value.replace(/[^0-9]/g, ""))} />
        <div>
          <button style={{ backgroundColor: "red", padding: 12, borderRadius: 6 }} onClick={() => searchBoletoInfos(barcodeDigitalLine)}>Buscar</button>
          {boletoInfos.sucess == true &&
            <div style={{ margin: 20, padding: 10, backgroundColor: "#fff", borderRadius: 10, color: "black", textAlign: "initial", marginRight: 70, marginLeft: 70 }}>
              <p>Type: {boletoInfos.type}</p>
              <p>TypeBarcode: {boletoInfos.boletoTypeBarcode}</p>
              <p>Amount R$: {boletoInfos.amount}</p>
              <p>DueDate: {boletoInfos.dueDate}</p>
              <p>Sucess: {boletoInfos.sucess ? 'true' : 'false'}</p>
            </div>
          }

          {boletoInfos.sucess == false && boletoInfos.message &&
            <div style={{ margin: 20, padding: 10, backgroundColor: "#fff", borderRadius: 10, color: "black", textAlign: "initial", marginRight: 70, marginLeft: 70 }}>
              <p>Message: {boletoInfos.message}</p>
              <p>Sucess: {boletoInfos.sucess ? 'true' : 'false'}</p>
            </div>
          }
        </div>



      </div>
    </main >
  )
}
