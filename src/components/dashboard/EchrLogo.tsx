interface EchrLogoProps {
  size?: number;
}

export function EchrLogo({ size = 32 }: EchrLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      stroke="var(--mantine-color-blue-7)"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path
        strokeWidth={4}
        d="M32 55C13 42 6 31 8.5 21.5C11 12.5 23 9.5 32 19.5C41 9.5 53 12.5 55.5 21.5C58 31 51 42 32 55Z"
      />
      <path strokeWidth={4.5} d="M17 33H25L29.5 24L35 42L39 33H47" />
    </svg>
  );
}
