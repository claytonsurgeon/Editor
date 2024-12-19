import "./PageFrame.css";

import RulerCol from "./ruler-col/RulerCol";
import RulerKey from "./ruler-key/RulerKey";
import RulerRow from "./ruler-row/RulerRow";
import TableDoc from "./table-doc/TableDoc";

export default function PageFrame() {
	RulerKey();
	RulerCol();
	RulerRow();
	TableDoc();
}
