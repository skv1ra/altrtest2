import { keyboardRows, type KeySpec } from "./scene-data";
import styles from "./HeroDevices.module.css";

function Key({ label, sub, units = 1, kind }: KeySpec) {
  const className = [
    styles.key,
    kind === "function" ? styles.functionKey : "",
    kind === "arrow" ? styles.arrowKey : "",
    !label ? styles.spaceKey : "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <span className={className} style={{ flexGrow: units, flexBasis: 0 }}>
      {sub && <small>{sub}</small>}
      <b>{label}</b>
    </span>
  );
}

export function MacBookKeyboard() {
  return (
    <div className={styles.keyboardWell} aria-hidden="true">
      <div className={styles.keyboardRows}>
        {keyboardRows.map((row, rowIndex) => (
          <div className={styles.keyboardRow} key={rowIndex}>
            {row.map((key, keyIndex) => (
              <Key key={`${rowIndex}-${keyIndex}-${key.label}`} {...key} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
