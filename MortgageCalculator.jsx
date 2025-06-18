export default function MortgageCalculator() {
  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">Mortgage Calculator</h2>
      <form className="flex flex-col gap-2">
        <input placeholder="Home Price" className="border p-2 rounded" />
        <input placeholder="Down Payment" className="border p-2 rounded" />
        <input placeholder="Loan Term (years)" className="border p-2 rounded" />
        <input placeholder="Interest Rate (%)" className="border p-2 rounded" />
        <button className="bg-blue-600 text-white p-2 rounded mt-2">Calculate</button>
      </form>
    </div>
  )
}
