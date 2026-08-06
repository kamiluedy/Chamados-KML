export default function Loading() {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <div
        style={{
          width: 28,
          height: 28,
          border: "2px solid rgba(124,58,237,0.2)",
          borderTopColor: "#7c3aed",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
