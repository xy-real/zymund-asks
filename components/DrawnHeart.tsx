/** A heart outline that draws itself, then fills (animation lives in globals.css). */
export function DrawnHeart() {
  return (
    <svg className="zy-heart" viewBox="0 0 100 90" aria-hidden>
      <path
        pathLength={1}
        d="M50 84C14 56 6 38 6 25C6 13 15 5 26 5C35 5 44 10 50 19C56 10 65 5 74 5C85 5 94 13 94 25C94 38 86 56 50 84Z"
      />
    </svg>
  );
}