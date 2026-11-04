import { Check, Loader2, MapPin, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { EnderecoEntrega } from '../types';

interface NominatimAddress {
  road?: string;
  house_number?: string;
  amenity?: string;
  building?: string;
  pedestrian?: string;
  suburb?: string;
  neighbourhood?: string;
  city_district?: string;
  city?: string;
  town?: string;
  municipality?: string;
  state?: string;
  postcode?: string;
}

interface NominatimItem {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
  address?: NominatimAddress;
}

interface SugestaoFormatada {
  id: number;
  titulo: string;
  subtitulo: string;
  ruaCompleta: string;
  lat: number;
  lng: number;
}

interface AutocompleteEnderecoProps {
  endereco: EnderecoEntrega;
  onChange: (novo: EnderecoEntrega) => void;
  placeholder?: string;
}

function formatarNominatim(item: NominatimItem): SugestaoFormatada {
  const addr = item.address ?? {};
  const ruaOuLugar = addr.road || addr.amenity || addr.building || addr.pedestrian || item.name || '';
  const numero = addr.house_number ? `, ${addr.house_number}` : '';
  const bairro = addr.suburb || addr.neighbourhood || addr.city_district || '';
  const cidade = addr.city || addr.town || addr.municipality || '';
  const estado = addr.state || '';

  const titulo = ruaOuLugar ? `${ruaOuLugar}${numero}` : item.display_name.split(',')[0];
  const subtitulo = [bairro, cidade, estado].filter(Boolean).join(' - ') || item.display_name;
  const ruaCompleta = [titulo, bairro, cidade].filter(Boolean).join(', ') || item.display_name;

  return {
    id: item.place_id,
    titulo,
    subtitulo,
    ruaCompleta,
    lat: Number(item.lat),
    lng: Number(item.lon),
  };
}

/**
 * Campo de busca de endereço com autocomplete gratuito via OpenStreetMap / Nominatim.
 * Retorna o endereço formatado e as coordenadas reais (lat, lng).
 */
export function AutocompleteEndereco({
  endereco,
  onChange,
  placeholder = 'Digite rua, número, bairro ou CEP...',
}: AutocompleteEnderecoProps) {
  const [texto, setTexto] = useState(endereco.rua);
  const [sugestoes, setSugestoes] = useState<SugestaoFormatada[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [aberto, setAberto] = useState(false);
  const [indiceFoco, setIndiceFoco] = useState(-1);
  const [coordenadasConfirmadas, setCoordenadasConfirmadas] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sincroniza se a rua mudar externamente
  useEffect(() => {
    setTexto(endereco.rua);
  }, [endereco.rua]);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function tratarCliqueFora(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    document.addEventListener('mousedown', tratarCliqueFora);
    return () => document.removeEventListener('mousedown', tratarCliqueFora);
  }, []);

  // Busca debounced no Nominatim (OpenStreetMap)
  useEffect(() => {
    const consulta = texto.trim();
    if (consulta.length < 3 || coordenadasConfirmadas) {
      setSugestoes([]);
      setCarregando(false);
      return;
    }

    const timer = setTimeout(async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setCarregando(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(consulta)}&countrycodes=br&addressdetails=1&limit=5`;
        const res = await fetch(url, {
          signal: controller.signal,
          headers: {
            'Accept-Language': 'pt-BR,pt;q=0.9',
          },
        });
        if (!res.ok) throw new Error('Falha ao buscar endereço');
        const dados: NominatimItem[] = await res.json();
        const formatadas = dados.map(formatarNominatim);
        setSugestoes(formatadas);
        setAberto(formatadas.length > 0);
        setIndiceFoco(-1);
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setSugestoes([]);
        }
      } finally {
        setCarregando(false);
      }
    }, 380);

    return () => {
      clearTimeout(timer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [texto, coordenadasConfirmadas]);

  function selecionarSugestao(sugestao: SugestaoFormatada) {
    setTexto(sugestao.ruaCompleta);
    setCoordenadasConfirmadas(true);
    setAberto(false);
    setSugestoes([]);
    onChange({
      rua: sugestao.ruaCompleta,
      lat: sugestao.lat,
      lng: sugestao.lng,
    });
  }

  function tratarMudancaTexto(novoTexto: string) {
    setTexto(novoTexto);
    setCoordenadasConfirmadas(false);
    onChange({
      ...endereco,
      rua: novoTexto,
    });
  }

  function tratarTeclas(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!aberto || sugestoes.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIndiceFoco((prev) => (prev + 1) % sugestoes.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndiceFoco((prev) => (prev <= 0 ? sugestoes.length - 1 : prev - 1));
    } else if (e.key === 'Enter') {
      if (indiceFoco >= 0 && indiceFoco < sugestoes.length) {
        e.preventDefault();
        selecionarSugestao(sugestoes[indiceFoco]);
      }
    } else if (e.key === 'Escape') {
      setAberto(false);
    }
  }

  return (
    <div className="autocomplete-container" ref={containerRef}>
      <div className="autocomplete-input-wrapper">
        <Search size={16} className="autocomplete-icone-busca" />
        <input
          type="text"
          className="autocomplete-input"
          value={texto}
          onChange={(e) => tratarMudancaTexto(e.target.value)}
          onKeyDown={tratarTeclas}
          onFocus={() => {
            if (sugestoes.length > 0 && !coordenadasConfirmadas) setAberto(true);
          }}
          placeholder={placeholder}
          autoComplete="off"
        />
        {carregando && <Loader2 size={16} className="autocomplete-spinner" />}
      </div>

      {aberto && sugestoes.length > 0 && (
        <ul className="autocomplete-sugestoes" role="listbox">
          {sugestoes.map((sugestao, idx) => (
            <li
              key={sugestao.id}
              role="option"
              aria-selected={idx === indiceFoco}
              className={`autocomplete-item ${idx === indiceFoco ? 'ativo' : ''}`}
              onClick={() => selecionarSugestao(sugestao)}
            >
              <MapPin size={16} className="autocomplete-item-icone" />
              <div className="autocomplete-item-conteudo">
                <span className="autocomplete-item-titulo">{sugestao.titulo}</span>
                <span className="autocomplete-item-subtitulo">{sugestao.subtitulo}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {coordenadasConfirmadas && (
        <div className="autocomplete-badge">
          <Check size={13} />
          <span>Localizado no mapa ({endereco.lat.toFixed(4)}, {endereco.lng.toFixed(4)})</span>
        </div>
      )}
    </div>
  );
}
