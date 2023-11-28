"use client";
import { useState } from "react";
import extractBoletoInfo from "./ts/boletoExtractInfo";

interface boletoInterface {
  barcode: string;
  type?: string;
  dueDate: string;
  boletoTypeBarcode: string;
  message: string;
  sucess: Boolean;
  amount: number;
}

export default function SearchBarCode() {
  const [barcodeDigitalLine, setBarcodeDigitalLine] = useState<string>("");
  const [boletoInfos, setBoletoInfos] = useState<boletoInterface>({
    barcode: "",
    type: "",
    boletoTypeBarcode: "",
    dueDate: "",
    message: "",
    sucess: false,
    amount: 0.0,
  });

  function searchBoletoInfos(barcodeDigitalLine: string) {
    setBoletoInfos({
      barcode: "",
      type: "",
      boletoTypeBarcode: "",
      dueDate: "",
      message: "",
      sucess: false,
      amount: 0.0,
    });

    const boletoInfosExtracted = extractBoletoInfo(barcodeDigitalLine);

    if (!boletoInfosExtracted?.sucess || !boletoInfosExtracted) {
      return setBoletoInfos((oldValues: boletoInterface) => {
        return {
          ...oldValues,
          message: "Boleto is not valid!",
        };
      });
    }

    const {
      barcodeInput,
      boletoType,
      boletoTypeInput,
      dueDate,
      message,
      sucess,
      value,
    } = boletoInfosExtracted;

    setBoletoInfos({
      barcode: barcodeInput,
      type: boletoType,
      boletoTypeBarcode: boletoTypeInput,
      dueDate: dueDate,
      message: "Boleto is valid",
      sucess: sucess,
      amount: value,
    });
  }

  const Status = () => {
    const colors: { sucess: string; failed: string } = {
      sucess: "green",
      failed: "red",
    };
    return (
      <p
        style={{
          paddingTop: 20,
          textAlign: "center",
          color: boletoInfos.sucess ? colors.sucess : colors.failed,
          fontSize: 22,
          fontWeight: 600,
        }}
      >
        {boletoInfos.sucess ? "Sucess" : "Not sucess"}
      </p>
    );
  };

  return (
    <main
      style={{
        display: "flex",
        width: "100%",
        height: "100vh",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ textAlign: "center" }}>
        Search BOLETO barcode digital line
        <input
          style={{
            borderRadius: 10,
            color: "black",
            margin: 10,
            padding: 10,
            width: "80%",
          }}
          value={barcodeDigitalLine}
          defaultValue={barcodeDigitalLine}
          onChange={({ target }) =>
            setBarcodeDigitalLine(target?.value.replace(/[^0-9]/g, ""))
          }
        />
        <div>
          <button
            style={{ backgroundColor: "red", padding: 12, borderRadius: 6 }}
            onClick={() => searchBoletoInfos(barcodeDigitalLine)}
          >
            Search
          </button>

          {boletoInfos.message && (
            <div
              style={{
                margin: 20,
                padding: 10,
                backgroundColor: "#fff",
                borderRadius: 10,
                color: "black",
                marginRight: 70,
                marginLeft: 70,
              }}
            >
              {boletoInfos.sucess == true ? (
                <div>
                  <p>
                    <b>Type:</b>
                  </p>
                  <p>{boletoInfos.type}</p>

                  <p>
                    <b>TypeBarcode:</b>
                  </p>
                  <p>{boletoInfos.boletoTypeBarcode}</p>

                  <p>
                    <b>Amount:</b>
                  </p>
                  <p>{boletoInfos.amount}</p>

                  <p>
                    <b>DueDate:</b>
                  </p>

                  <p>{boletoInfos.dueDate}</p>
                </div>
              ) : boletoInfos.sucess == false && boletoInfos.message ? (
                <>
                  <p>
                    <b>Message:</b>
                  </p>
                  <p>{boletoInfos.message}</p>
                </>
              ) : undefined}
              <Status />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
