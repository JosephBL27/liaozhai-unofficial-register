import { ExternalLink } from "lucide-react";

const editorialPasses = [
  {
    verb: "Route",
    title: "Begin with an editorial register",
    body: "Fifteen registers group representative tales by recurring form and social field, so a reader can enter the collection through a legible question.",
    boundary: "The route is not Pu Songling's volume order and does not claim to be complete.",
  },
  {
    verb: "Read",
    title: "Open a working record",
    body: "Each dossier gathers a summary, figures, motifs, terms, a social pressure, and prompts into one reading leaf beside the selected register.",
    boundary: "Summaries and prompts are editorial material; no quotation or edition reference is fabricated.",
  },
  {
    verb: "Trace",
    title: "Follow recurrence, not descent",
    body: "Relation edges connect figures, institutions, motifs, and pressures that recur across the representative route.",
    boundary: "An edge does not assert genealogy, geographic proximity, or a single closed cosmology.",
  },
  {
    verb: "Inspect",
    title: "Keep the construction visible",
    body: "Ornament, data marks, and semantic hit targets remain separate. React owns state, D3 computes geometry, and GSAP coordinates registration motion.",
    boundary: "A future edition layer should name its translation, tale numbers, pages, and critical citations.",
  },
] as const;

const sources = [
  {
    title: "Endless Stories: Pu Songling and His Liaozhai Zhiyi",
    publisher: "National Museum of China",
    href: "https://en.chnmuseum.cn/exhibition/exhibition_series/temporary_exhibitions/historical_and_cultural_exhibition/202606/t20260622_279753.html",
  },
  {
    title: "The Printed Image in China",
    publisher: "The Metropolitan Museum of Art",
    href: "https://www.metmuseum.org/exhibitions/listings/2012/printed-image-in-china",
  },
  {
    title: "Liaozhai-associated ink painting",
    publisher: "The British Museum",
    href: "https://www.britishmuseum.org/collection/object/A_1990-1127-0-7",
  },
  {
    title: "Early Qing to 1723",
    publisher: "The Cambridge History of Chinese Literature",
    href: "https://www.cambridge.org/core/books/abs/cambridge-history-of-chinese-literature/early-qing-to-1723/D6E740C64EDB9E678E2F8E8911FEBB23",
  },
];

export function MethodView() {
  return (
    <section className="workspace-view method-view" aria-labelledby="method-title">
      <header className="workspace-view-heading">
        <div>
          <h1 id="method-title">How to read this register</h1>
          <p>The interface makes its editorial scaffolding, generated material, and technical boundaries inspectable.</p>
        </div>
      </header>

      <figure className="method-ornament">
        <img
          src="/assets/ornaments/liaozhai-bamboo-register.svg"
          alt="Original bamboo correction-register ornament with an unlettered manuscript leaf"
          width="960"
          height="180"
          decoding="async"
        />
        <figcaption>
          Original optimized SVG · bamboo, manuscript correction, and misregistered rules · no period object reproduced
        </figcaption>
      </figure>

      <div className="method-apparatus">
        <div className="method-apparatus-index" aria-hidden="true">
          <strong>04</strong>
          <span>passes through the record</span>
          <i />
        </div>
        <ol className="method-sequence" aria-label="Editorial reading sequence">
          {editorialPasses.map((pass, index) => (
            <li key={pass.verb}>
              <span className="method-step-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <div className="method-step-heading">
                <span>{pass.verb}</span>
                <h2>{pass.title}</h2>
              </div>
              <div className="method-step-reading">
                <p>{pass.body}</p>
                <p><strong>Boundary</strong>{pass.boundary}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="method-apparatus-note">
          <strong>Correction rule</strong>
          When the apparatus cannot support historical or edition-specific precision, it marks the omission instead of making the interface look certain.
        </p>
      </div>

      <section className="source-ledger" aria-labelledby="sources-title">
        <h2 id="sources-title">Visual and contextual source pass</h2>
        <p>These institutional sources informed the material world; the interface does not reproduce their pages as UI or present generated illustration as evidence.</p>
        <ul>
          {sources.map((source, index) => (
            <li key={source.href}>
              <span className="source-ledger-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <a href={source.href} target="_blank" rel="noreferrer">
                <strong>{source.title}</strong>
                <span>{source.publisher}</span>
                <ExternalLink aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
