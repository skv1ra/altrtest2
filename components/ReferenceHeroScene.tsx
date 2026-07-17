import styles from "./ReferenceHeroScene.module.css";

export function ReferenceHeroScene() {
  return (
    <div className={styles.scene} aria-hidden="true">
      <img
        className={styles.image}
        src="/altr-hero-reference.svg"
        alt=""
        draggable={false}
      />
    </div>
  );
}
