export default function EmptyState({ icone = '📭', titulo, subtitulo }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">{icone}</span>
      {titulo && <p className="font-display font-bold text-lg">{titulo}</p>}
      {subtitulo && <p className="text-sm text-gray">{subtitulo}</p>}
    </div>
  )
}
