import React from "react";
import "./styles.css";

function CustomersByOrder() {
  return (
    <div className="App">
      <header className="App-header">
        <iframe 
         title="Top 10 Customers Report"
         width="600"
         height="450" 
         src="https://lookerstudio.google.com/embed/reporting/6a62acc6-cdb7-4766-a2a7-7818a4d792a3/page/WV2jD" 
         frameborder="0" 
        style={{ border: 0 }} 
        allowfullscreen>
        </iframe>
      </header>
    </div>
  );
}

export default CustomersByOrder;
