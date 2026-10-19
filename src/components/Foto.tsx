/**
 * Mostra a foto do produto. No mock a "foto" é um emoji; no backend, uma URL.
 * A cor de fundo muda com o `id`, só para os cards não ficarem todos iguais.
 */
export function Foto({ foto, id = 0, grande = false }: { foto: string; id?: number; grande?: boolean }) {
  const ehUrl = foto.startsWith('http') || foto.startsWith('/');
  const cor = `hsl(${(id * 47) % 360} 80% 93%)`;
  return (
    <div className={grande ? 'foto foto-grande' : 'foto'} style={{ background: cor }}>
      {ehUrl ? <img src={foto} alt="" /> : foto || '🍽️'}
    </div>
  );
}
