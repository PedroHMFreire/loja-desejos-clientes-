import { Fragment } from "react"

export default function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null

  return (
    <Fragment>
      <div className="fixed inset-0 bg-black bg-opacity-40 z-40" onClick={onClose}></div>
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-white rounded shadow-lg p-6 w-full max-w-md relative animate-fade-in">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
            aria-label="Fechar"
            type="button"
          >
            &times;
          </button>
          {children}
        </div>
      </div>
    </Fragment>
  )
}