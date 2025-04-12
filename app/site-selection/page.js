import styles from "./page.module.css";
import LogoutButton from "../components/logout-button";
import Link from "next/link";
import LotusBloomHeader from "../components/header/LotusBloomHeader";

export default function SiteSelection() {
  return (
    <div>
      <LotusBloomHeader />
      <div className={styles.page}>
        <h1 className={styles.title}>Select a Site!</h1>
        <div className={styles.selectionGrid}>
          <Link href="/site/san-antonio-family-resource-center">
            <div className={styles.site}>
              San Antonio Family Resource Center
            </div>
          </Link>
          <Link href="/site/lotus-bloom-downtown">
            <div className={styles.site}>Lotus Bloom Downtown</div>
          </Link>
          <Link href="/site/room-to-bloom-east-oakland">
            <div className={styles.site}>Room to Bloom East Oakland</div>
          </Link>
          <Link href="/site/lotus-bloom-general">
            <div className={styles.site}>Lotus Bloom General</div>
          </Link>
          <Link href="/site/family-navigation">
            <div className={styles.site}>Family Navigation</div>
          </Link>
          <Link href="/site/another-super-duper-awesome-site">
            <div className={styles.site}>Another Super Duper Awesome Site</div>
          </Link>
        </div>
        <LogoutButton />
      </div>
    </div>
  );
}
