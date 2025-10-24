sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"com/cuprum/zccbgs/js/utilities/OdataUtilities",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/json/JSONModel",
	'sap/ui/core/Fragment',
	'sap/m/MessageToast',
	'sap/m/MessageBox',
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/PDFViewer",
	"sap/m/ComboBox",
	"sap/ui/core/BusyIndicator",
	"sap/ui/export/Spreadsheet",
	"sap/ui/export/library"
],
	function (Controller, OdataUtilities, ODataModel, JSONModel, Fragment, MessageToast, MessageBox, Filter, FilterOperator, PDFViewer, ComboBox, BusyIndicator, Spreadsheet, library) {
		"use strict";

		const EdmType = library.EdmType;

		return Controller.extend("com.cuprum.zccbgs.controller.InitialView", {
			onInit: function () {
				var frgForm = "com.cuprum.zccbgs.view.fragments.FilterFragment";
				this.fragmentFormType = sap.ui.xmlfragment(this.getView().getId(), frgForm, this);
				this.getView().byId("fragmentContent").addContent(this.fragmentFormType);


				var currentYear = new Date().getFullYear();
				var startYear = 2000;
				var yearRange = [];


				for (var i = startYear; i <= currentYear + 10; i++) {
					yearRange.push({
						key: i.toString(),
						text: i.toString()
					});
				}

				console.log(yearRange);


				var oYearModel = new JSONModel(yearRange);
				this.getView().byId("inYear").setModel(oYearModel);

			},
			onYearSelect: function (oEvent) {
				var selectedYear = oEvent.getParameter("selectedItem").getKey();
				console.log("Año seleccionado: " + selectedYear);
			},


			getAccountSetModel: function (oEvent) {
				/*var filters = "";
			    
				var oOdataUtilities = new OdataUtilities();
				var oController = this;
	
				var readAccountSet = oOdataUtilities.setAccountSetModel(oController, filters);
	
				readAccountSet
					.then(oController.setAccountSetModel.bind(oController))
					.catch(function (res) {
						MessageBox.show("no responde", {
							icon: MessageBox.Icon.WARNING,
							title: "Stop"
						});
					});*/

				var sInputValue = oEvent.getSource().getValue(),

					oView = this.getView();


				/*if (!this._pValueHelpDialog) {
					this._pValueHelpDialog = Fragment.load({
						id: oView.getId(),
						name: "com.cuprum.zccbgs.view.fragments.matchcode.DialogAccountFragment",
						controller: this
					}).then(function (oDialog) {
						oView.addDependent(oDialog);
						return oDialog;
					});
				    
				}*/


				if (!this.byId("DialogAccountFragment")) {
					Fragment.load({
						id: oView.getId(),
						name: "com.cuprum.zccbgs.view.fragments.matchcode.DialogAccountFragment",
						controller: this
					}).then(function (oDialog) {
						oView.addDependent(oDialog);
						oDialog.open();
					});
				} else {
					this.byId("DialogAccountFragment").open();
				}

				this.byId("DialogAccountFragment").then(function (oDialog) {
					// Create a filter for the binding
					oDialog.getBinding("items").filter([new Filter("Hktid", FilterOperator.Contains, sInputValue)]);
					// Open ValueHelpDialog filtered by the input's value
					oDialog.open(sInputValue);
				});
			},

			getCompanySetModel: function (oEvent) {
				var sInputValue = oEvent.getSource().getValue(),

					oView = this.getView();

				/*if (!this._pValueHelpDialog) {
					this._pValueHelpDialog = Fragment.load({
						id: oView.getId(),
						name: "com.cuprum.zccbgs.view.fragments.matchcode.DialogCompanyFragment",
						controller: this
					}).then(function (oDialog) {
						oView.addDependent(oDialog);
						return oDialog;
					});
				}*/

				if (!this.byId("DialogCompanyFragment")) {
					Fragment.load({
						id: oView.getId(),
						name: "com.cuprum.zccbgs.view.fragments.matchcode.DialogCompanyFragment",
						controller: this
					}).then(function (oDialog) {
						oView.addDependent(oDialog);
						oDialog.open();
					});
				} else {
					this.byId("DialogCompanyFragment").open();
				}

				this.byId("DialogCompanyFragment").then(function (oDialog) {
					// Create a filter for the binding
					oDialog.getBinding("items").filter([new Filter("Bukrs", FilterOperator.Contains, sInputValue)]);
					// Open ValueHelpDialog filtered by the input's value
					oDialog.open(sInputValue);
				});
			},

			getCCBSetModel: function (oEvent) {
				var oView = this.getView();

				var Bukrs = this.getView().byId("inCompany").getValue();
				var Hktid = this.getView().byId("inAccount").getValue();
				var Month = this.getView().byId("inMonth").getValue();
				var Year = oView.byId("inYear").getValue();


				var sUrlPrev = "/sap/opu/odata/sap/ZZ1_CCB_GS_SRV/";
				var sUrl = "/Pdf_XsSet(Bukrs='" + Bukrs + "',Hktid='" + Hktid + "',Monat='" + Month + "',Gjahr='" + Year + "')";

				//console.log(sUrlPrev);

				var oServiceModel = new sap.ui.model.odata.ODataModel(sUrlPrev, true);
				//console.log(oServiceModel);

				sap.ui.getCore().setModel(oServiceModel);

				oServiceModel.read(sUrl, {
					success: jQuery.proxy(function (mResponse) {
						//console.log("ok");
						//console.log(mResponse);
						var oJsonModel = new sap.ui.model.json.JSONModel();
						oJsonModel.setData(mResponse);
						//console.log(oJsonModel.getData().Base64);

						var decodePdfContent = atob(oJsonModel.getData().Base64);
						//var byteArray = new Uint8Array(decodePdfContent.length);
						var byteArray = new Array(decodePdfContent.length);

						for (var i = 0; i < decodePdfContent.length; i++) {
							byteArray[i] = decodePdfContent.charCodeAt(i);
						}
						var byteArray2 = new Uint8Array(byteArray);
						var blob = new Blob([byteArray2.buffer], { type: 'application/pdf' });
						var _pdfurl = URL.createObjectURL(blob);

						//Intento de mostrar en ui5
						if (!this._pdfViewer) {
							/*oEvent._PDFViewer = PDFViewer({
								source: _pdfurl
							});*/
							this._pdfViewer = new PDFViewer({
								isTrustedSource: true
							});
							//this.getView().addDependent(this._pdfViewer);

							var oSample1Model = new JSONModel({
								Source: sap.ui.require.toUrl("com/cuprum/zccbgs/js/utilities/sample.pdf"),
								Preview: sap.ui.require.toUrl("com/cuprum/zccbgs/js/utilities/sample1.jpg")
							});
							//this.getView().setModel(oSample1Model, "Sample"); 
							var sSource = oSample1Model.getData().Source;
							this._pdfViewer.setSource(_pdfurl);

							//jQuery.sap.addUrlWhiteList("blob");
							//this._pdfViewer.open(); importante que en el futuro si se solucione esto 
						}
						//Fin intento de mostrar en ui5
						//console.log(_pdfurl);

						window.open(_pdfurl);

						/*this._PDFViewer.downloadPDF = function(){
							File.save(
								byteArray.buffer,
								"Descargando",
								"PDF",
								"application/pdf"
							);
						};*/



					}, oEvent),
					error: jQuery.proxy(function (mResponse) {
						console.log("no");
						console.log(mResponse);
					}, oEvent)
				});

				/*this._pdfViewer = new PDFViewer({
					isTrustedSource : true
				});
				this.getView().addDependent(this._pdfViewer);
	
				var oSample1Model = new JSONModel({
					Source: sap.ui.require.toUrl("com/cuprum/zccbgs/js/utilities/sample.pdf"),
					Preview: sap.ui.require.toUrl("com/cuprum/zccbgs/js/utilities/sample1.jpg")
				});
				this.getView().setModel(oSample1Model, "Sample"); 
				var sSource = this.getView().getModel("Sample").getData().Source;
				this._pdfViewer.setSource(sSource);
				this._pdfViewer.setTitle("My Custom Title");
				this._pdfViewer.open();*/
			},

			_AccountSearch: function (oEvent) {
				var sValue = oEvent.getParameter("value");
				var oFilter = new Filter("Hktid", sap.ui.model.FilterOperator.Contains, sValue);

				oEvent.getSource().getBinding("items").filter([oFilter]);
			},

			_AccountClose: function (oEvent) {
				var oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					return;
				}

				this.byId("inAccount").setValue(oSelectedItem.getTitle());
			},

			_CompanySearch: function (oEvent) {
				var sValue = oEvent.getParameter("value");
				var oFilter = new Filter("Bukrs", sap.ui.model.FilterOperator.Contains, sValue);

				oEvent.getSource().getBinding("items").filter([oFilter]);
			},

			_CompanyClose: function (oEvent) {
				var oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					return;
				}

				this.byId("inCompany").setValue(oSelectedItem.getTitle());
			},

			/*setAccountSetModel: function (_oResult){
	
				var oResults = _oResult;
				console.log(oResults);
				var oModelAccountColl = new JSONModel();
	
				oModelAccountColl.setSizeLimit(500);
				oModelAccountColl.setData(oResults);
	
				this.getView().setModel(oModelAccountColl, "oModelAccountColl");
				this.getView().setModel(this.getView().getModel("oModelAccountColl"));
	
				var oView = this.getView();
	
				if (!this.byId("DialogAccountFragment")) {
					Fragment.load({
						id: oView.getId(),
						name: "com.cuprum.zccbgs.view.fragments.matchcode.DialogAccountFragment",
						controller: this
					}).then(function (oDialog) {
						oView.addDependent(oDialog);
						oDialog.open();
					});
				} else {
					this.byId("DialogAccountFragment").open();
				}
	
			},*/

			/*_AccountSearch: function (evt) {
				var sValue = evt.getParameter("value");
				var oFilter = new Filter(
					"Bukrs",
					sap.ui.model.FilterOperator.Contains, sValue
				);
				evt.getSource().getBinding("items").filter([oFilter]);
			},
	
			_SiteClose: function (evt) {
				var oSelectedItem = evt.getParameter("selectedItem");
				if (oSelectedItem) {
					var productInput = this.byId(this.inputId);
					productInput.setValue(oSelectedItem.getTitle() + "-" + oSelectedItem.getDescription());
				}
				evt.getSource().getBinding("items").filter([]);
			}*/




			/**
			 * Exporta datos filtrados a un archivo Excel.
			 * Flujo:
			 *  1️⃣ Construye filtros a partir de la vista
			 *  2️⃣ Llama al servicio OData
			 *  3️⃣ Valida respuesta (sin datos → mensaje informativo)
			 *  4️⃣ Transforma y genera archivo Excel
			 *  5️⃣ Muestra mensaje de éxito o error
			 */
			onExportExcel: async function () {
				let oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

				try {
					// 🌀 Paso 0: Mostrar indicador de carga global
					BusyIndicator.show(0);

					// 🧩 Paso 1: Obtener valores desde la vista
					let oBukrs = this.getView().byId("inCompany").getValue(); // 4000
					let oHktid = this.getView().byId("inAccount").getValue(); // 63019
					let oMonat = this.getView().byId("inMonth").getSelectedKey(); // 04
					let oGjahr = this.getView().byId("inYear").getSelectedKey(); // 2025
					let oCmonth = parseInt(oMonat);
					let oCyear = parseInt(oGjahr);

					// 🚀 Construir filtro dinámico (usando helper reutilizable)
					let sFilter = this._buildFilter({
						bukrs: oBukrs,
						hktid: oHktid,
						monat: oMonat,
						gjahr: oGjahr
					});

					// 🔍 Paso 2: Ejecutar lectura OData con filtros
					console.groupCollapsed("%c[onExportExcel] Llamada OData", "color:#0070f3;font-weight:bold;");
					console.info("Entidad: /zz1_ccb_od_xls");
					console.info("Filtro:", sFilter);
					console.groupEnd();

					let aRaw = await this._readOnce("/zz1_ccb_od_xls", {
						"$filter": sFilter,
						"$format": "json"
					});

					// ⚠️ Paso 3: Validar respuesta vacía
					if (!aRaw || !aRaw.length) {
						BusyIndicator.hide();
						MessageBox.information(
							oBundle.getText("excel.noData"), // texto i18n
							{ title: oBundle.getText("excel.infoTitle") }
						);
						return;
					}

					// 🔄 Paso 4: Transformar estructura de datos a formato Excel
					let aRows = aRaw.map(r => ({
						[oBundle.getText("excel.col.fecha")]: this._parseSapDate(r.bldat),
						[oBundle.getText("excel.col.documento")]: r.belnr || "",
						[oBundle.getText("excel.col.prctr")]: r.prctr || "",
						[oBundle.getText("excel.col.importe")]: this._toNumber(r.monto),
						[oBundle.getText("excel.col.moneda")]: r.waers || "",
						[oBundle.getText("excel.col.descripcion")]: r.sgtxt || ""
					}));

					// 🧱 Paso 5: Definir columnas del Excel
					let EdmType = library.EdmType;
					let aColumns = [
						{ label: oBundle.getText("excel.col.fecha"), property: oBundle.getText("excel.col.fecha"), type: EdmType.String },
						{ label: oBundle.getText("excel.col.documento"), property: oBundle.getText("excel.col.documento"), type: EdmType.String },
						{ label: oBundle.getText("excel.col.prctr"), property: oBundle.getText("excel.col.prctr"), type: EdmType.String },
						{ label: oBundle.getText("excel.col.importe"), property: oBundle.getText("excel.col.importe"), type: EdmType.Number, scale: 2 },
						{ label: oBundle.getText("excel.col.moneda"), property: oBundle.getText("excel.col.moneda"), type: EdmType.String },
						{ label: oBundle.getText("excel.col.descripcion"), property: oBundle.getText("excel.col.descripcion"), type: EdmType.String }
					];

					// 📦 Paso 6: Crear archivo Excel
					let oSettings = {
						workbook: { columns: aColumns },
						dataSource: aRows,
						fileName: this._excelFileName(oBundle.getText("excel.filename"))
					};

					let oSheet = new Spreadsheet(oSettings);
					await oSheet.build();
					oSheet.destroy();

					// 🎉 Paso 7: Notificar éxito
					MessageToast.show(oBundle.getText("excel.success"));

				} catch (e) {
					// 💥 Manejo de errores
					console.error("%c[onExportExcel Error]", "color:red;font-weight:bold;", e);
					MessageToast.show(oBundle.getText("excel.error"));

				} finally {
					// 🧹 Paso 8: Ocultar indicador busy (siempre)
					BusyIndicator.hide();
				}
			},




			/**
			 * Lee una colección OData una sola vez y devuelve un arreglo plano (results)
			 * Ajusta el modelo (por nombre) y parámetros según tu servicio
			 */
			_readOnce: function (sEntityPath, mUrlParams = {}) {
				let oModel = this.getView().getModel("ZZ1_CCB_OD_XLS_CDS");
				return new Promise((resolve, reject) => {
					oModel.read(sEntityPath, {
						urlParameters: mUrlParams,
						success: (oData) => {
							let oResponse = (oData && (oData.results || oData.d?.results)) || [];
							console.log("oResponse", oResponse);
							resolve(oResponse);
						},
						error: reject
					});
				});
			},


			_buildFilter: function (o) {
				return [
					`bukrs eq '${o.bukrs}'`,
					`hktid eq '${o.hktid}'`,
					`monat le '${o.monat}'`,
					`gjahr le '${o.gjahr}'`,
					`(cmonth gt ${parseInt(o.monat)} or cyear gt ${parseInt(o.gjahr)})`
				].join(" and ");

			},


			/**
			 * Convierte string numérico a Number (p.ej. "-40800.60")
			 */
			_toNumber: function (v) {
				if (v === null || v === undefined) return null;
				let n = Number(String(v).replace(/,/g, "")); // por si viniera con comas
				return Number.isNaN(n) ? null : n;
			},

			/**
			 * Genera nombre de archivo con timestamp
			 */
			_excelFileName: function (base) {
				let pad = (x) => String(x).padStart(2, "0");
				let d = new Date();
				let y = d.getFullYear();
				let mo = pad(d.getMonth() + 1);
				let da = pad(d.getDate());
				let hh = pad(d.getHours());
				let mm = pad(d.getMinutes());
				let ss = pad(d.getSeconds());
				return `${base}_${y}${mo}${da}_${hh}${mm}${ss}.xlsx`;
			},

			/**
 * Convierte fechas SAP o JS Date a formato "dd/MM/yyyy"
 * Admite:
 *  - /Date(1711920000000)/  (formato OData clásico)
 *  - Objeto Date (Mon Mar 31 2025 18:00:00 GMT-0600)
 *  - String ISO (2025-03-31T18:00:00Z)
 */
			_parseSapDate: function (vDate) {
				try {
					if (!vDate) return "";

					let oDate;

					// Caso 1: formato OData /Date(1711920000000)/
					if (typeof vDate === "string" && vDate.indexOf("/Date(") === 0) {
						let iTimestamp = parseInt(vDate.replace(/[^0-9]/g, ""), 10);
						oDate = new Date(iTimestamp);
					}
					// Caso 2: ya es Date
					else if (vDate instanceof Date) {
						oDate = vDate;
					}
					// Caso 3: string tipo "Mon Mar 31 2025 18:00:00 GMT-0600"
					else if (typeof vDate === "string" && vDate.includes("GMT")) {
						oDate = new Date(vDate);
					}
					// Caso 4: string ISO "2025-03-31T00:00:00Z"
					else {
						oDate = new Date(vDate);
					}

					if (isNaN(oDate.getTime())) return "";

					let dd = String(oDate.getDate()).padStart(2, "0");
					let mm = String(oDate.getMonth() + 1).padStart(2, "0");
					let yyyy = oDate.getFullYear();

					return `${dd}/${mm}/${yyyy}`;
				} catch (e) {
					console.warn("Error al formatear fecha:", vDate, e);
					return "";
				}
			},




		});
	});
