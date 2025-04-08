import LoginButton from "./components/login-button";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}></main>
      <h1>Michelle is AMAZING</h1>
      <LoginButton />
    </div>
  );
}
