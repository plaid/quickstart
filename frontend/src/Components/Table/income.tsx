import React from "react";

import { DataItem, 
        IncomeEmployeeDataItem, 
        IncomeEployerDataItem, 
        PayPeroidDataItem,
        IncomeBreakdownDataItem
        } from "../../dataUtilities";

import styles from "./income.module.scss";

interface Props {
  data: Array<DataItem>;
}


const Income = (props: any) => {

    const rawData = props.data
    const employeeInfo: IncomeEmployeeDataItem = rawData[0];
    const employerInfo: IncomeEployerDataItem = rawData[1];
    const payPeoridInfo: PayPeroidDataItem = rawData[2];
    const breakArray: Array<IncomeBreakdownDataItem> = rawData[3];

    console.log(rawData)
   
//   const identityHeaders = props.categories.map((category, index) => (
//     <span key={index} className={styles.identityHeader}>
//       {category.title}
//     </span>
//   ));

  const breakdownRows = breakArray.map((breakdown: IncomeBreakdownDataItem | any, index) => (
   
      
        <span key={index} className={styles.dataField}>
         Type: {breakdown.type} Amount: {breakdown.amount}  Rate: {breakdown.rate}   Hours: {breakdown.rate}
        </span>
      
  ));


  return (
      
    <div className={styles.paystubsWrapper}> 
      <span className={styles.paystubsMainHeader} >Verification Data</span>
      <div ></div>
      <div className={styles.paystubsSectionwrapper}>
        <span className={styles.infoTop}> Employee Name:  {employeeInfo.name}  </span>
        <span className={styles.infoBottom}>Address:  {employeeInfo.street}, {employeeInfo.city}, {employeeInfo.region} {employeeInfo.zip} </span>
      </div>
      <div className={styles.paystubsSectionwrapper}>
        <span className={styles.infoTop}> Employer Name:  {employerInfo.name} </span>
        <span className={styles.infoBottom}>Address:  {employeeInfo.street}, {employeeInfo.city}, {employeeInfo.region} {employeeInfo.zip}{"\n"}  </span>
      </div>
      <div className={styles.paystubsSectionwrapper}>Pay Period
          <span className={styles.payPeoridDataRows}> Start Date: {payPeoridInfo.startDate}         End Date: {payPeoridInfo.endDate}</span>
          <span className={styles.payPeoridDataRows}> Gross Pay: ${payPeoridInfo.grossPay}         On Check Pay: ${payPeoridInfo.onCheckPay}</span>
      </div>
      <div className={styles.paystubsSectionwrapper}>
            {breakdownRows}
      </div>
    </div>
  );
};

Income.displayName = "Income";

export default Income;
