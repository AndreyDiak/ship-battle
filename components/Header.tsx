
type Props = {
  title: string
}

function Header({title} : Props) {
  return (
    <div>
      <h2 className="text-center uppercase text-gray-600 w-full 
        bg-red-300 py-2 text-white font-bold">
        {title}
      </h2>
    </div>
  )
}

export default Header