// Localização do aparelho (Geolocation do navegador) + endereço por extenso (OpenStreetMap Nominatim).
// Não passa pelo gateway: o Nominatim é público e aceita chamada direta do navegador.

export interface Localizacao {
  rua: string;
  lat: number;
  lng: number;
}

function posicaoAtual(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Seu navegador não informa a localização'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, (e) => {
      reject(new Error(e.code === e.PERMISSION_DENIED
        ? 'Você não deixou o site ver sua localização. Libere no navegador ou digite o endereço.'
        : 'Não deu para pegar sua localização agora. Tente de novo ou digite o endereço.'));
    }, { enableHighAccuracy: true, timeout: 10_000 });
  });
}

interface RespostaNominatim {
  display_name?: string;
  address?: {
    road?: string;
    house_number?: string;
    suburb?: string;
    neighbourhood?: string;
    city?: string;
    town?: string;
  };
}

/** Ex.: "Rua Quatá, 300 - Vila Olímpia, São Paulo". Sem número, o cliente completa à mão. */
function montarRua({ address, display_name }: RespostaNominatim) {
  if (!address?.road) return display_name ?? '';
  const numero = address.house_number ? `, ${address.house_number}` : '';
  const bairro = address.suburb ?? address.neighbourhood;
  const cidade = address.city ?? address.town;
  return `${address.road}${numero}${bairro ? ` - ${bairro}` : ''}${cidade ? `, ${cidade}` : ''}`;
}

/**
 * Pega a posição do aparelho e transforma em endereço.
 * Se o endereço por extenso falhar, devolve só as coordenadas (rua vazia) para o cliente digitar.
 */
export async function buscarMinhaLocalizacao(): Promise<Localizacao> {
  const { coords } = await posicaoAtual();
  const lat = coords.latitude;
  const lng = coords.longitude;
  try {
    const resposta = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=pt-BR`,
    );
    if (!resposta.ok) throw new Error();
    return { rua: montarRua(await resposta.json()), lat, lng };
  } catch {
    return { rua: '', lat, lng };
  }
}
