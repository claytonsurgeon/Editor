import "./PageFrame.css";

import PageTable from "./page-table/PageTable";
import RulerCol from "./ruler-col/RulerCol";
import RulerKey from "./ruler-key/RulerKey";
import RulerRow from "./ruler-row/RulerRow";

export default function PageFrame() {
	RulerKey();
	RulerCol();
	RulerRow();
	PageTable();
}
