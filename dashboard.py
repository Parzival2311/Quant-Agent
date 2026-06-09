import streamlit as st
import pandas as pd
import os

st.set_page_config(page_title="Quant Strategies Dashboard", layout="wide")

st.title("📈 Autonomous Quant Lab - Strategies Dashboard")
st.markdown("View generated strategies, hypotheses, and their evaluation metrics.")

excel_path = os.path.join(os.path.dirname(__file__), "data", "strategies", "strategies_log.xlsx")

if not os.path.exists(excel_path):
    st.warning("No strategies found! Please run the orchestrator first.")
else:
    df = pd.read_excel(excel_path)
    
    st.subheader("Overview")
    col1, col2, col3 = st.columns(3)
    col1.metric("Total Generated", len(df))
    col2.metric("Approved", len(df[df["Status"] == "APPROVED"]))
    col3.metric("Rejected", len(df[df["Status"] == "REJECTED"]))
    
    st.divider()
    
    # Display each strategy
    st.subheader("Strategy Details")
    for index, row in df.iterrows():
        status_color = "🟢" if row["Status"] == "APPROVED" else "🔴"
        with st.expander(f"{status_color} {row['Strategy ID']} - Ticker: {row['Ticker']} - {row['Status']}"):
            
            st.markdown("### Hypothesis & Rationale")
            st.info(row["Hypothesis"])
            
            col_m1, col_m2 = st.columns(2)
            with col_m1:
                st.markdown("#### Baseline Metrics")
                st.write(f"**Baseline Sharpe:** {row.get('Sharpe Ratio', 0.0)} | **Stress Sharpe:** {row.get('Stress Sharpe Ratio', 0.0)}")
                st.write(f"**Max Drawdown:** {row.get('Max Drawdown', 0.0)}")
                st.write(f"**Total Return:** {row.get('Total Return', 0.0)}")
                st.write(f"**Final Value:** ${row.get('Final Value', 0.0):.2f}")
                st.write(f"**Win Rate:** {row.get('Win Rate (%)', 0.0):.2f}%")
            
            with col_m2:
                st.markdown("#### Critic Applied Friction")
                st.warning(row["Critic Reasoning"] if pd.notna(row["Critic Reasoning"]) else "None")
                
            st.markdown("#### Judge Reasoning")
            if row["Status"] == "APPROVED":
                st.success(row["Judge Reasoning"] if pd.notna(row["Judge Reasoning"]) else "None")
            else:
                st.error(row["Judge Reasoning"] if pd.notna(row["Judge Reasoning"]) else "None")
            
            if pd.notna(row["Error Log"]) and row["Error Log"] != "None":
                st.markdown("#### Error Log")
                st.code(row["Error Log"], language="python")
