export default function Navbar() {
  return (
    <nav>
      <a href="/" className="flex items-center gap-4 mt-3 mb-10">
        <img
          src="images/icons/icon-128.png"
          alt="logo"
          width={40}
          height={40}
        />
        <span>V-Loader</span>
      </a>
    </nav>
  )
}
