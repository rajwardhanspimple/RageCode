import { type ComponentProps } from "solid-js"

export const Mark = (props: { class?: string }) => {
  return (
    <svg
      data-component="logo-mark"
      classList={{ [props.class ?? ""]: !!props.class }}
      viewBox="0 0 16 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path data-slot="logo-logo-mark-shadow" d="M12 16H4V8H12V16Z" fill="var(--icon-weak-base)" />
      <path data-slot="logo-logo-mark-o" d="M12 4H4V16H12V4ZM16 20H0V0H16V20Z" fill="var(--icon-strong-base)" />
    </svg>
  )
}

/** The Ragestar R sigil, sized for the boot splash. Same geometry as the in-app mark. */
export const OwlSplash = (props: Pick<ComponentProps<"svg">, "ref" | "class">) => {
  return (
    <svg
      ref={props.ref}
      data-component="logo-owl-splash"
      classList={{ [props.class ?? ""]: !!props.class }}
      viewBox="0 0 256 256"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M72 16 H184 A56 56 0 0 1 240 72 V184 A56 56 0 0 1 184 240 H72 A56 56 0 0 1 16 184 V72 A56 56 0 0 1 72 16 Z"
        fill="#2a0e0b"
      />
      <path d="M128 16 H72 A56 56 0 0 0 16 72 V184 A56 56 0 0 0 72 240 H128 Z" fill="#3a120e" />
      {/* Rim light: on a near-black splash the dark facets alone lose their silhouette. */}
      <path
        d="M72 16 H184 A56 56 0 0 1 240 72 V184 A56 56 0 0 1 184 240 H72 A56 56 0 0 1 16 184 V72 A56 56 0 0 1 72 16 Z"
        fill="none"
        stroke="#f04430"
        stroke-width="6"
        stroke-linejoin="round"
        opacity="0.9"
      />
      <path
        d="M76 52 H136 L170 60 Q196 70 196 100 Q196 128 172 136 L200 204 H158 L132 142 H116 V204 H76 Z M116 90 H142 Q156 90 156 106 Q156 122 142 122 H116 Z"
        fill="url(#rage-splash-fill)"
        fill-rule="evenodd"
      />
      <defs>
        <linearGradient id="rage-splash-fill" x1="76" y1="52" x2="200" y2="204" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#ffb3a0" />
          <stop offset="0.5" stop-color="#e02416" />
          <stop offset="1" stop-color="#b91c0f" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export const Splash = (props: Pick<ComponentProps<"svg">, "ref" | "class">) => {
  return (
    <svg
      ref={props.ref}
      data-component="logo-splash"
      classList={{ [props.class ?? ""]: !!props.class }}
      viewBox="0 0 80 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M60 80H20V40H60V80Z" fill="var(--icon-base)" />
      <path d="M60 20H20V80H60V20ZM80 100H0V0H80V100Z" fill="var(--icon-strong-base)" />
    </svg>
  )
}

export const Logo = (props: { class?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 234 42"
      fill="none"
      classList={{ [props.class ?? ""]: !!props.class }}
    >
      <g>
        <path d="M18 30H6V18H18V30Z" fill="var(--icon-weak-base)" />
        <path d="M18 12H6V30H18V12ZM24 36H0V6H24V36Z" fill="var(--icon-base)" />
        <path d="M48 30H36V18H48V30Z" fill="var(--icon-weak-base)" />
        <path d="M36 30H48V12H36V30ZM54 36H36V42H30V6H54V36Z" fill="var(--icon-base)" />
        <path d="M84 24V30H66V24H84Z" fill="var(--icon-weak-base)" />
        <path d="M84 24H66V30H84V36H60V6H84V24ZM66 18H78V12H66V18Z" fill="var(--icon-base)" />
        <path d="M108 36H96V18H108V36Z" fill="var(--icon-weak-base)" />
        <path d="M108 12H96V36H90V6H108V12ZM114 36H108V12H114V36Z" fill="var(--icon-base)" />
        <path d="M144 30H126V18H144V30Z" fill="var(--icon-weak-base)" />
        <path d="M144 12H126V30H144V36H120V6H144V12Z" fill="var(--icon-strong-base)" />
        <path d="M168 30H156V18H168V30Z" fill="var(--icon-weak-base)" />
        <path d="M168 12H156V30H168V12ZM174 36H150V6H174V36Z" fill="var(--icon-strong-base)" />
        <path d="M198 30H186V18H198V30Z" fill="var(--icon-weak-base)" />
        <path d="M198 12H186V30H198V12ZM204 36H180V6H198V0H204V36Z" fill="var(--icon-strong-base)" />
        <path d="M234 24V30H216V24H234Z" fill="var(--icon-weak-base)" />
        <path d="M216 12V18H228V12H216ZM234 24H216V30H234V36H210V6H234V24Z" fill="var(--icon-strong-base)" />
      </g>
    </svg>
  )
}
