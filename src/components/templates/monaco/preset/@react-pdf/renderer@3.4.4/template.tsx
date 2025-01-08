import React from "react"; // v18
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  renderToStream,
} from "@react-pdf/renderer"; // v3.4.4
import _ from "lodash";

const MyDocument = (props: { data: any }) => {
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
          <Text>{_.upperFirst(props.data.name)}</Text>
        </View>
        <View style={styles.section}>
          <Text>Section #2</Text>
        </View>
      </Page>
    </Document>
  );
};

// The function will be imported and used. Please keep this function or export the same type of function.
export default (data: any /* your input */): Promise<NodeJS.ReadableStream> => {
  return renderToStream(<MyDocument data={data} />);
};
