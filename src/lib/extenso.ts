const unidades = [
  '',
  'um',
  'dois',
  'três',
  'quatro',
  'cinco',
  'seis',
  'sete',
  'oito',
  'nove',
  'dez',
  'onze',
  'doze',
  'treze',
  'quatorze',
  'quinze',
  'dezesseis',
  'dezessete',
  'dezoito',
  'dezenove',
]
const dezenas = [
  '',
  '',
  'vinte',
  'trinta',
  'quarenta',
  'cinquenta',
  'sessenta',
  'setenta',
  'oitenta',
  'noventa',
]
const centenas = [
  '',
  'cento',
  'duzentos',
  'trezentos',
  'quatrocentos',
  'quinhentos',
  'seiscentos',
  'setecentos',
  'oitocentos',
  'novecentos',
]

export function extenso(n: number): string {
  if (n === 100) return 'cem'
  if (n < 20) return unidades[n]
  if (n < 100) return dezenas[Math.floor(n / 10)] + (n % 10 !== 0 ? ' e ' + unidades[n % 10] : '')
  if (n < 1000)
    return centenas[Math.floor(n / 100)] + (n % 100 !== 0 ? ' e ' + extenso(n % 100) : '')
  if (n < 1000000) {
    const mil = Math.floor(n / 1000)
    const resto = n % 1000
    return (
      (mil === 1 ? 'mil' : extenso(mil) + ' mil') +
      (resto !== 0 ? (resto < 100 || resto % 100 === 0 ? ' e ' : ' ') + extenso(resto) : '')
    )
  }
  return n.toString()
}

export function valorPorExtenso(valor: number): string {
  if (!valor || isNaN(valor) || valor <= 0) return ''
  const reais = Math.floor(valor)
  const centavos = Math.round((valor - reais) * 100)
  let res = ''
  if (reais > 0) res += extenso(reais) + (reais === 1 ? ' real' : ' reais')
  if (centavos > 0) {
    if (res !== '') res += ' e '
    res += extenso(centavos) + (centavos === 1 ? ' centavo' : ' centavos')
  }
  return res
}
