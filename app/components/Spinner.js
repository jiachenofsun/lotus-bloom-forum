export default function Spinner() {
  return (
    <div
      style={{
        display: "inline-block",
        width: 24,
        height: 24,
        border: "3px solid #c69cc0",
        borderTop: "3px solid #784692",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }}
    />
  );
}
