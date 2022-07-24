
type Props = {
  href: string
}

function Avatar({href} : Props) {
  return (
    <div className="w-10 h-10 rounded-full overflow-hidden">
      {href && (
        <img src={href} alt='profileImg' />
      )}
    </div>
  )
}

export default Avatar