"use client";

import React, { useState } from "react";
import Image from "next/image";
import styles from "./LotusBloomHeader.module.css";

export default function LotusBloomHeader() {
  const [tocOpen, setTocOpen] = useState(false);

  const toggleTOC = () => {
    setTocOpen((prev) => !prev);
  };

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <Image
            src="/LotusBloomLogo.png"
            alt="Lotus Bloom Logo"
            width={100}
            height={35}
            style={{ height: "auto" }}
          />
          <h1 className={styles.title}>Lotus Bloom</h1>
        </div>

        <div className={styles.menuIconContainer} onClick={toggleTOC}>
          <Image
            src="/menu-icon.svg"
            alt="Menu"
            width={40}
            height={40}
            style={{ height: "auto" }}
          />
        </div>
      </header>

      <div className={styles.separator} />

      <div
        className={styles.tocOverlay}
        style={{
          pointerEvents: tocOpen ? "auto" : "none",
          opacity: tocOpen ? 1 : 0,
        }}
        onClick={toggleTOC}
      >
        <div
          className={styles.toc}
          style={{
            transform: tocOpen ? "translateX(0%)" : "translateX(100%)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className={styles.tocTitle}>Table of Contents</h2>
          <ul className={styles.tocList}>
            <li>
              <a
                href="#about-us"
                className={styles.tocLink}
                onClick={toggleTOC}
              >
                About Us...
              </a>
            </li>
            <li>
              <a href="#contact" className={styles.tocLink} onClick={toggleTOC}>
                Contact Us!
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
