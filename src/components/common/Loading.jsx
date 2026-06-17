export default function Loading({ texto = 'Carregando...' }) {
  return (
    <div className="loading-center" style={{ flexDirection: 'column', gap: 12 }}>
      <div className="spinner" />
      <span className="text-gray text-sm">{texto}</span>
    </div>
  )
}
