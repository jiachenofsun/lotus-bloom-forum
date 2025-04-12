import LoginButton from "./components/login-button";
import styles from "./page.module.css";
import Image from "next/image";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.container}>
          <Image src="/LBText.jpg" alt="picture" width={202} height={150} />
          <h1>Welcome!</h1>
          <LoginButton />
        </div>
      </main>
    </div>
  );
}
