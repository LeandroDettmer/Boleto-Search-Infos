"use-strict"

function extractBoletoInfo(barcode: string) {
  const typeCode = identifyBarcodeType(barcode);

  const ret: any = {};
  barcode = barcode.replace(/[^0-9]/g, "");

  if (barcode.length == 36) {
    barcode = barcode + "00000000000";
  } else if (barcode.length == 46) {
    barcode = barcode + "0";
  }

  ret.sucess = true;
  ret.barcodeInput = barcode;
  ret.message = "Boleto válido";

  const formatDate = (boletoDueDate: Date) => {
    const year = boletoDueDate.getUTCFullYear();
    const month = String(boletoDueDate.getUTCMonth() + 1).padStart(2, "0");
    const day = String(boletoDueDate.getUTCDate()).padStart(2, "0");

    const actualYear = new Date().getUTCFullYear();;
    if (year < actualYear) {
      return (new Date().getUTCFullYear()
        + "-" +
        String(new Date().getUTCMonth() + 1).padStart(2, "0")
        + "-" +
        String(new Date().getUTCDate()).padStart(2, "0"));
    }
    return year + "-" + month + "-" + day;
  };

  switch (typeCode) {
    case "LINHA_DIGITAVEL":
      ret.boletoTypeInput = "LINHA_DIGITAVEL";
      ret.boletoType = identifyTypeBoleto(barcode);
      ret.barcode = digitalLine2CodBarras(barcode);
      ret.digitableLine = barcode;
      ret.dueDate = formatDate(identificarData(barcode, "LINHA_DIGITAVEL"));
      ret.dueDateDefault = identificarData(barcode, "LINHA_DIGITAVEL").toISOString();
      ret.value = getValue(barcode, "LINHA_DIGITAVEL");
      break;
    case "CODIGO_DE_BARRAS":
      ret.boletoTypeInput = "CODIGO_DE_BARRAS";
      ret.boletoType = identifyTypeBoleto(barcode);
      ret.barcode = barcode;
      ret.digitableLine = codBarras2LinhaDigitavel(barcode, false);
      ret.dueDate = formatDate(identificarData(barcode, "CODIGO_DE_BARRAS"));
      ret.dueDateDefault = identificarData(barcode, "CODIGO_DE_BARRAS").toISOString();
      ret.value = getValue(barcode, "CODIGO_DE_BARRAS");
      break;
    default:
      ret.message = "Boleto não encontrado"
      ret.sucess = false
      break;
  }
  return ret;
}

function identificarData(codigo: string, tipoCodigo: string) {
  codigo = codigo.replace(/[^0-9]/g, "");
  const tipoBoleto = identifyTypeBoleto(codigo);

  let fatorData = "";
  const dataBoleto = new Date("1997-10-07T20:54:59.000Z");

  if (tipoCodigo === "CODIGO_DE_BARRAS") {
    if (tipoBoleto == "BANCO" || tipoBoleto == "CARTAO_DE_CREDITO") {
      fatorData = codigo.substr(5, 4);
    } else {
      fatorData = "0";
    }
  } else if (tipoCodigo === "LINHA_DIGITAVEL") {
    if (tipoBoleto == "BANCO" || tipoBoleto == "CARTAO_DE_CREDITO") {
      fatorData = codigo.substr(33, 4);
    } else {
      fatorData = "0";
    }
  }

  const fatorDataNum = Number(fatorData);
  const dataAtual = new Date();
  dataAtual.setUTCHours(0, 0, 0, 0);
  dataBoleto.setUTCDate(dataBoleto.getUTCDate() + fatorDataNum);
  dataBoleto.setUTCHours(dataAtual.getUTCHours(), dataAtual.getUTCMinutes(), dataAtual.getUTCSeconds(), dataAtual.getUTCMilliseconds());

  return dataBoleto;

}

function digitalLine2CodBarras(codigo: any) {
  codigo = codigo.replace(/[^0-9]/g, "");

  const tipoBoleto = identifyTypeBoleto(codigo);

  let resultado = "";

  if (tipoBoleto == "BANCO" || tipoBoleto == "CARTAO_DE_CREDITO") {
    resultado = codigo.substr(0, 4) +
      codigo.substr(32, 1) +
      codigo.substr(33, 14) +
      codigo.substr(4, 5) +
      codigo.substr(10, 10) +
      codigo.substr(21, 10);
  } else {

    codigo = codigo.split("");
    codigo.splice(11, 1);
    codigo.splice(22, 1);
    codigo.splice(33, 1);
    codigo.splice(44, 1);
    codigo = codigo.join("");

    resultado = codigo;
  }

  return resultado;
}

function getValueCodBarrasArrecadacao(codigo: string, tipoCodigo: string) {
  codigo = codigo.replace(/[^0-9]/g, "");
  const isValorEfetivo = identificarReferencia(codigo)?.efetivo;

  let valorBoleto: string | string[] = "";
  let valorFinal;

  if (isValorEfetivo) {
    if (tipoCodigo == "LINHA_DIGITAVEL") {
      valorBoleto = codigo.substr(4, 14);
      valorBoleto = codigo.split("");
      valorBoleto.splice(11, 1);
      valorBoleto = valorBoleto.join("");
      valorBoleto = valorBoleto.substr(4, 11);
    } else if (tipoCodigo == "CODIGO_DE_BARRAS") {
      valorBoleto = codigo.substr(4, 11);
    }

    valorFinal = valorBoleto.substr(0, 9) + "." + valorBoleto.substr(9, 2);

    let char = valorFinal.substr(1, 1);
    while (char === "0") {
      valorFinal = valorFinal.slice(0, 1) + valorFinal.slice(2);
      char = valorFinal.substr(1, 1);
    }

  } else {
    valorFinal = 0;
  }

  return valorFinal;
}

function getValue(codigo: string, tipoCodigo: string) {

  const tipoBoleto = identifyTypeBoleto(codigo);

  let valorBoleto = "";
  let valorFinal: any;

  if (tipoCodigo == "CODIGO_DE_BARRAS") {
    if (tipoBoleto == "BANCO" || tipoBoleto == "CARTAO_DE_CREDITO") {
      valorBoleto = codigo.substr(9, 10);
      valorFinal = valorBoleto.substr(0, 8) + "." + valorBoleto.substr(8, 2);

      let char = valorFinal.substr(1, 1);
      while (char === "0") {
        valorFinal = valorFinal.slice(0, 1) + valorFinal.slice(2);
        char = valorFinal.substr(1, 1);
      }
    } else {
      valorFinal = getValueCodBarrasArrecadacao(codigo, "CODIGO_DE_BARRAS");
    }

  } else if (tipoCodigo == "LINHA_DIGITAVEL") {
    if (tipoBoleto == "BANCO" || tipoBoleto == "CARTAO_DE_CREDITO") {
      valorBoleto = codigo.substr(37);
      valorFinal = valorBoleto.substr(0, 8) + "." + valorBoleto.substr(8, 2);

      let char = valorFinal.substr(1, 1);
      while (char === "0") {
        valorFinal = valorFinal.slice(0, 1) + valorFinal.slice(2);
        char = valorFinal.substr(1, 1);
      }
    } else {
      valorFinal = getValueCodBarrasArrecadacao(codigo, "LINHA_DIGITAVEL");
    }
  }
  return parseFloat(valorFinal);
}

function identifyBarcodeType(barcode: string) {
  if (typeof barcode !== "string") throw new TypeError("Insira uma string válida!");

  barcode = barcode.replace(/[^0-9]/g, "");

  if (barcode.length == 44) {
    return "CODIGO_DE_BARRAS";
  } else if (barcode.length == 46 || barcode.length == 47 || barcode.length == 48) {
    return "LINHA_DIGITAVEL";
  } else {
    return "TAMANHO_INCORRETO";
  }
}

function identifyTypeBoleto(codigo: string) {
  codigo = codigo.replace(/[^0-9]/g, "");

  if (typeof codigo !== "string") throw new TypeError("Insira uma string válida!");

  if (codigo.substr(-14) == "00000000000000" || codigo.substr(5, 14) == "00000000000000") {
    return "CARTAO_DE_CREDITO";
  } else if (codigo.substr(0, 1) == "8") {
    if (codigo.substr(1, 1) == "1") {
      return "ARRECADACAO_PREFEITURA";
    } else if (codigo.substr(1, 1) == "2") {
      return "CONVENIO_SANEAMENTO";
    } else if (codigo.substr(1, 1) == "3") {
      return "CONVENIO_ENERGIA_ELETRICA_E_GAS";
    } else if (codigo.substr(1, 1) == "4") {
      return "CONVENIO_TELECOMUNICACOES";
    } else if (codigo.substr(1, 1) == "5") {
      return "ARRECADACAO_ORGAOS_GOVERNAMENTAIS";
    } else if (codigo.substr(1, 1) == "6" || codigo.substr(1, 1) == "9") {
      return "OUTROS";
    } else if (codigo.substr(1, 1) == "7") {
      return "ARRECADACAO_TAXAS_DE_TRANSITO";
    }
  } else {
    return "BANCO";
  }
}

function validateCodeWithDv(barcode: string, typeCode: string) {
  barcode = barcode.replace(/[^0-9]/g, "");
  let tipoBoleto;

  let resultado;

  if (typeCode === "LINHA_DIGITAVEL") {
    tipoBoleto = identifyTypeBoleto(barcode);

    if (tipoBoleto == "BANCO" || tipoBoleto == "CARTAO_DE_CREDITO") {
      const bloco1 = barcode.substr(0, 9) + calculaMod10(barcode.substr(0, 9));
      const bloco2 = barcode.substr(10, 10) + calculaMod10(barcode.substr(10, 10));
      const bloco3 = barcode.substr(21, 10) + calculaMod10(barcode.substr(21, 10));
      const bloco4 = barcode.substr(32, 1);
      const bloco5 = barcode.substr(33);

      resultado = (bloco1 + bloco2 + bloco3 + bloco4 + bloco5).toString();
    } else {
      const identificacaoValorRealOuReferencia = identificarReferencia(barcode);
      let bloco1: any;
      let bloco2;
      let bloco3;
      let bloco4;

      if (identificacaoValorRealOuReferencia?.mod == 10) {
        bloco1 = barcode.substr(0, 11) + calculaMod10(barcode.substr(0, 11));
        bloco2 = barcode.substr(12, 11) + calculaMod10(barcode.substr(12, 11));
        bloco3 = barcode.substr(24, 11) + calculaMod10(barcode.substr(24, 11));
        bloco4 = barcode.substr(36, 11) + calculaMod10(barcode.substr(36, 11));
      } else if (identificacaoValorRealOuReferencia?.mod == 11) {
        bloco1 = barcode.substr(0, 11);
        bloco2 = barcode.substr(12, 11);
        bloco3 = barcode.substr(24, 11);
        bloco4 = barcode.substr(36, 11);

        const dv1 = parseInt(barcode.substr(11, 1));
        const dv2 = parseInt(barcode.substr(23, 1));
        const dv3 = parseInt(barcode.substr(35, 1));
        const dv4 = parseInt(barcode.substr(47, 1));

        const valid = (calculaMod11(bloco1) == dv1 &&
          calculaMod11(bloco2) == dv2 &&
          calculaMod11(bloco3) == dv3 &&
          calculaMod11(bloco4) == dv4);

        return valid;
      }

      resultado = bloco1 + bloco2 + bloco3 + bloco4;
    }
  } else if (typeCode === "CODIGO_DE_BARRAS") {
    tipoBoleto = identifyTypeBoleto(barcode);

    if (tipoBoleto == "BANCO" || tipoBoleto == "CARTAO_DE_CREDITO") {
      const DV = calculaDVCodBarras(barcode, 4, 11);
      resultado = barcode.substr(0, 4) + DV + barcode.substr(5);
    } else {
      const identificacaoValorRealOuReferencia: any = identificarReferencia(barcode);

      resultado = barcode.split("");
      resultado.splice(3, 1);
      resultado = resultado.join("");

      const DV = calculaDVCodBarras(barcode, 3, identificacaoValorRealOuReferencia?.mod);
      resultado = resultado.substr(0, 3) + DV + resultado.substr(3);

    }
  }

  return barcode === resultado;
}

function calculaDVCodBarras(codigo: any, posicaoCodigo: number, mod: number) {
  codigo = codigo.replace(/[^0-9]/g, "");

  codigo = codigo.split("");
  codigo.splice(posicaoCodigo, 1);
  codigo = codigo.join("");

  if (mod === 10) {
    return calculaMod10(codigo);
  } else if (mod === 11) {
    return calculaMod11(codigo);
  }
}

function identificarReferencia(codigo: string) {
  codigo = codigo.replace(/[^0-9]/g, "");
  const referencia = codigo.substr(2, 1);
  if (typeof codigo !== "string") throw new TypeError("Insira uma string válida!");
  switch (referencia) {
    case "6":
      return {
        mod: 10,
        efetivo: true
      };
      break;
    case "7":
      return {
        mod: 10,
        efetivo: false
      };
      break;
    case "8":
      return {
        mod: 11,
        efetivo: true
      };
      break;
    case "9":
      return {
        mod: 11,
        efetivo: false
      };
      break;
    default:
      break;
  }
}

function codBarras2LinhaDigitavel(codigo: string, formatada: any) {
  codigo = codigo.replace(/[^0-9]/g, "");
  const tipoBoleto = identifyTypeBoleto(codigo);
  let resultado = "";
  if (tipoBoleto == "BANCO" || tipoBoleto == "CARTAO_DE_CREDITO") {
    const novaLinha = codigo.substr(0, 4) + codigo.substr(19, 25) + codigo.substr(4, 1) + codigo.substr(5, 14);
    const bloco1: any = novaLinha.substr(0, 9) + calculaMod10(novaLinha.substr(0, 9));
    const bloco2: any = novaLinha.substr(9, 10) + calculaMod10(novaLinha.substr(9, 10));
    const bloco3: any = novaLinha.substr(19, 10) + calculaMod10(novaLinha.substr(19, 10));
    const bloco4: any = novaLinha.substr(29);
    resultado = (bloco1 + bloco2 + bloco3 + bloco4).toString();
    if (formatada) {
      resultado =
        resultado.slice(0, 5) +
        "." +
        resultado.slice(5, 10) +
        " " +
        resultado.slice(10, 15) +
        "." +
        resultado.slice(15, 21) +
        " " +
        resultado.slice(21, 26) +
        "." +
        resultado.slice(26, 32) +
        " " +
        resultado.slice(32, 33) +
        " " +
        resultado.slice(33);
    }
  } else {
    const identificacaoValorRealOuReferencia = identificarReferencia(codigo);
    let bloco1: any;
    let bloco2: any;
    let bloco3: any;
    let bloco4: any;

    if (identificacaoValorRealOuReferencia?.mod == 10) {
      bloco1 = codigo.substr(0, 11) + calculaMod10(codigo.substr(0, 11));
      bloco2 = codigo.substr(11, 11) + calculaMod10(codigo.substr(11, 11));
      bloco3 = codigo.substr(22, 11) + calculaMod10(codigo.substr(22, 11));
      bloco4 = codigo.substr(33, 11) + calculaMod10(codigo.substr(33, 11));
    } else if (identificacaoValorRealOuReferencia?.mod == 11) {
      bloco1 = codigo.substr(0, 11) + calculaMod11(codigo.substr(0, 11));
      bloco2 = codigo.substr(11, 11) + calculaMod11(codigo.substr(11, 11));
      bloco3 = codigo.substr(22, 11) + calculaMod11(codigo.substr(22, 11));
      bloco4 = codigo.substr(33, 11) + calculaMod11(codigo.substr(33, 11));
    }
    resultado = bloco1 + bloco2 + bloco3 + bloco4;
  }
  return resultado;
}

function calculaMod10(numero: string | number | any) {
  numero = numero.replace(/\D/g, "");
  let i;
  let mult = 2;
  let soma = 0;
  let s = "";

  for (i = numero.length - 1; i >= 0; i--) {
    s = (mult * parseInt(numero.charAt(i))) + s;
    if (--mult < 1) {
      mult = 2;
    }
  }
  for (i = 0; i < s.length; i++) {
    soma = soma + parseInt(s.charAt(i));
  }
  soma = soma % 10;
  if (soma != 0) {
    soma = 10 - soma;
  }
  return soma;
}

function calculaMod11(x: any) {
  const sequencia = [4, 3, 2, 9, 8, 7, 6, 5];
  let digit = 0;
  let j = 0;
  let DAC = 0;

  for (let i = 0; i < x.length; i++) {
    const mult = sequencia[j];
    j++;
    j %= sequencia.length;
    digit += mult * parseInt(x.charAt(i));
  }

  DAC = digit % 11;

  if (DAC == 0 || DAC == 1)
    return 0;
  if (DAC == 10)
    return 1;

  return (11 - DAC);
}

export default extractBoletoInfo
