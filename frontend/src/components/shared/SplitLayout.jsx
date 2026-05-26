export function SplitLayout({ children, image, imageAlt, eyebrow, title, subtitle }) {
  return (
    <section className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-16">
      <div className="flex flex-col justify-center">
        {eyebrow && (
          <span className="mb-3 inline-flex w-fit items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
            {eyebrow}
          </span>
        )}
        {title && (
          <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="mt-3 max-w-xl text-base text-muted-foreground">{subtitle}</p>
        )}
        <div className="mt-6">{children}</div>
      </div>
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-accent/10 via-transparent to-primary/10 blur-2xl" />
        <img
          src={image}
          alt={imageAlt}
          loading="lazy"
          className="w-full max-w-xl rounded-3xl object-cover shadow-card"
        />
      </div>
    </section>
  );
}