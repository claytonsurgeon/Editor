import "./Input.css";

export default function Input() {
	document.querySelectorAll<HTMLInputElement>("code").forEach(elm => {
		elm.addEventListener("input", function (evt) {});
	});
}
