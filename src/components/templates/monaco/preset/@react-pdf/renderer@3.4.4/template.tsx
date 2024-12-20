import React from "react"; // v18
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer"; // v3.4.4
import lodash from "lodash";
const MyDocument = (data: any /* your input */) => {
  const styles = StyleSheet.create({
    page: {
      flexDirection: "row",
      backgroundColor: "#E4E4E4",
    },
    section: {
      margin: 10,
      padding: 10,
      flexGrow: 1,
    },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text>Section #1</Text>
        </View>
        <View style={styles.section}>
          <Text>Section #2</Text>
        </View>
      </Page>
    </Document>
  );
};

export default MyDocument;
// The default export target of the template will be imported and used.
// Please make sure the file has a default export.
