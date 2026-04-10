function App() {
  const handlePing = () => {
    // @ts-ignore (define in dts)
    window.api.ping()
  }

  return (
    <div className="container">
      <h1>PromptBridge</h1>
      <button onClick={handlePing}>Test IPC (Hello World)</button>
    </div>
  )
}

export default App
