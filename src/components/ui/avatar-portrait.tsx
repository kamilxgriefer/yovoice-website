type AvatarPortraitProps = {
  variant: "maya" | "alex" | "luna" | "noah";
  name: string;
};

const variants = {
  maya: {
    background: "from-fuchsia-500 via-purple-500 to-violet-800",
    skin: "#F2B88F",
    hair: "#2E163E",
    shirt: "#8B5CF6",
  },
  alex: {
    background: "from-cyan-500 via-blue-500 to-violet-800",
    skin: "#D9A17D",
    hair: "#1B2038",
    shirt: "#0EA5E9",
  },
  luna: {
    background: "from-rose-500 via-pink-500 to-purple-800",
    skin: "#E9B38A",
    hair: "#552040",
    shirt: "#F43F5E",
  },
  noah: {
    background: "from-indigo-500 via-violet-500 to-blue-800",
    skin: "#B97858",
    hair: "#241B29",
    shirt: "#6366F1",
  },
};

export function AvatarPortrait({
  variant,
  name,
}: AvatarPortraitProps) {
  const palette = variants[variant];

  return (
    <div
      className={`relative size-full overflow-hidden rounded-full bg-gradient-to-br ${palette.background}`}
      role="img"
      aria-label={`${name} avatar`}
    >
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 size-full"
        aria-hidden="true"
      >
        <circle cx="50" cy="43" r="21" fill={palette.skin} />
        <path
          d="M27 43C27 22 38 13 51 13C69 13 77 26 73 48C68 35 62 27 49 28C38 28 32 33 27 43Z"
          fill={palette.hair}
        />
        <path
          d="M18 102C20 76 32 66 50 66C68 66 80 76 82 102Z"
          fill={palette.shirt}
        />
        <circle cx="42" cy="44" r="2.2" fill="#201723" />
        <circle cx="58" cy="44" r="2.2" fill="#201723" />
        <path
          d="M43 54C47 57 53 57 57 54"
          stroke="#8B4B55"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M28 39C32 30 39 24 50 24C61 24 68 29 72 39"
          stroke={palette.hair}
          strokeWidth="7"
          strokeLinecap="round"
        />
      </svg>

      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/20 via-transparent to-white/20" />
    </div>
  );
}
