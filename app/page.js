import LoginButton from "./components/login-button";
import styles from "./page.module.css";
import Image from "next/image";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.container}>
          <Image src="/LBText.jpg" alt="picture" width={202} height={150} />
          <h1 className={styles.welcomeHeader}>
            Welcome to the Lotus Bloom Discussion Forum!
          </h1>

          <LoginButton />
          <div className={styles.additionalInfo}>
            Note: When logging in/signing up, a one-time code will be sent to
            your email. Check your spam!
          </div>
        </div>
      </main>
    </div>
  );
}
