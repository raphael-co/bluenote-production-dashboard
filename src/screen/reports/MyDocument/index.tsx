import React from 'react';
import { Page, Document, Image, StyleSheet } from '@react-pdf/renderer';


const pdfStyles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        padding: 10,
    },
    section: {
        marginBottom: 10,
    },
    title: {
        fontSize: 20,
        marginBottom: 10,
    },
    text: {
        fontSize: 12,
    },
    image: {
        marginBottom: 10,
        aspectRatio: '16/9',
    },
});

const MyDocument = ({ images }: { images: string[] }) => (
    <Document>
        <Page size="A4" style={pdfStyles.page}>
            {images.map((image, index) => (
                <Image key={index} src={image} style={pdfStyles.image} />
            ))}
        </Page>
    </Document>
);

export default MyDocument;