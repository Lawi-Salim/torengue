import React from 'react';
import './styles.css';

const Factures = React.forwardRef(function Factures(props, ref) {
  const {
    numero,
    date,
    echeance,
    emetteur,
    destinataire,
    lignes,
    totalHT,
    totalTTC,
    mentions
  } = props;
  return (
  <div className="facture-apercu" ref={ref}>
    <div className="facture-header">
      <div className="facture-logo">Torengue</div>
      <div className="facture-meta">
        <div><strong>DATE :</strong> {date}</div>
        <div><strong>ÉCHÉANCE :</strong> {echeance}</div>
        <div><strong>FACTURE N° :</strong> {numero}</div>
        <div className="facture-title">FACTURE</div>
      </div>
    </div>
    <div className="facture-infos">
      <div>
        <strong>ÉMETTEUR :</strong><br />
          {emetteur?.nom}<br />
          {emetteur?.adresse}<br />
          {emetteur?.tel}<br />
          {emetteur?.email}
      </div>
      <div>
        <strong>DESTINATAIRE :</strong><br />
          {destinataire?.nom}<br />
          {destinataire?.adresse}<br />
          {destinataire?.tel}<br />
          {destinataire?.email}
      </div>
    </div>
    <table className="facture-table">
      <thead>
        <tr>
          <th>Description</th>
          <th>Prix Unitaire</th>
          <th>Quantité</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        {lignes && lignes.map((l, i) => (
          <tr key={i}>
            <td>{l.desc}</td>
            <td>{l.pu}</td>
            <td>{l.qte}</td>
            <td>{l.total}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <div className="facture-totaux">
        <div><strong>TOTAL :</strong> {totalHT}</div>
    </div>
      {mentions && (
    <div className="facture-mentions">
      {mentions}
    </div>
      )}
  </div>
  );
});

export default Factures;
