
type Props = {
  title: string
  color?: string
}

function Header({title, color} : Props) {
  return (
    <div>
      <h2 className={`text-center uppercase w-full 
        bg-red-300 py-2 text-white font-bold ${color}`}>
        {title}
      </h2>
    </div>
  )
}

export default Header