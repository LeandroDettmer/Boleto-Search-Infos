"use client"
import { useState } from 'react'

export default function SearchBarCode() {
  const [boletoDigitalLine, setBoletoDigitalLine] = useState("");

  console.log(boletoDigitalLine)

  return (
    <main style={{ display: "flex", width: "100%", height: "100vh", alignItems: "center", justifyContent: "center", }}>
      <div style={{ textAlign: "center" }}>
        Search barcode digital line
        <div>
          <textarea style={{ borderRadius: 10, color: "black" }} onChange={({ target }) => setBoletoDigitalLine(target?.value)} />
        </div>
      </div>

    </main >
  )
}
