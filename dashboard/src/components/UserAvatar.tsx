interface UserAvatarProps {
  name: string
  size?: 'sm' | 'md'
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function UserAvatar({ name, size = 'md' }: UserAvatarProps) {
  const dim = size === 'sm' ? 'h-8 w-8 text-xs' : 'h-9 w-9 text-sm'
  return (
    <div
      className={`flex ${dim} shrink-0 items-center justify-center rounded-full bg-brand-light font-semibold text-brand`}
      title={name}
    >
      {initials(name) || '?'}
    </div>
  )
}
