function Logo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
      <rect width="56" height="56" rx="14" fill="#534AB7"/>
      <text x="28" y="42" fontSize="32" fontWeight="bold" fill="white" fontFamily="Arial" textAnchor="middle">₹</text>
    </svg>
  )
}

export default Logo