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
			* Handler del botón: lee datos (o usa tu modelo local) y exporta
			*/
			onExportExcel: async function () {
				try {
					BusyIndicator.show(0);

					let oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

					// 1) OBTENER LOS DATOS
					let oBukrs = this.getView().byId("inCompany").getValue();
					let oHktid = this.getView().byId("inAccount").getValue();
					let oMonat = this.getView().byId("inMonth").getSelectedKey();
					let oGjahr = this.getView().byId("inYear").getSelectedKey();
					let oCmonth = parseInt(oMonat);
					let oCyear = parseInt(oGjahr);

					let sUrl = "/zz1_ccb_od_xls?$filter=bukrs eq '" + oBukrs +
						"' and hktid eq '" + oHktid +
						"' and monat le '" + oMonat +
						"' and gjahr le '" + oGjahr +
						"' and ( cmonth gt " + oCmonth + " or cyear gt " + oCyear + " )";
					// console.log("sUrl:", sUrl);

					let aRaw = await this._readOnce(sUrl);

					if (!aRaw.length) {
						MessageToast.show(oBundle.getText("excel.noData"));
						return;
					}

					// 2) TRANSFORMAR
					let aRows = aRaw.map(r => ({
						[oBundle.getText("excel.col.fecha")]: this._parseSapDate(r.bldat),
						[oBundle.getText("excel.col.documento")]: r.belnr || "",
						[oBundle.getText("excel.col.prctr")]: r.prctr || "",
						[oBundle.getText("excel.col.importe")]: this._toNumber(r.monto),
						[oBundle.getText("excel.col.moneda")]: r.waers || "",
						[oBundle.getText("excel.col.descripcion")]: r.sgtxt || ""
					}));

					// 3) DEFINIR COLUMNAS (usa el módulo importado)
					let EdmType = library.EdmType; // 👈 ojo aquí
					let aColumns = [
						{ label: oBundle.getText("excel.col.fecha"), property: oBundle.getText("excel.col.fecha"), type: EdmType.Date },
						{ label: oBundle.getText("excel.col.documento"), property: oBundle.getText("excel.col.documento"), type: EdmType.String },
						{ label: oBundle.getText("excel.col.prctr"), property: oBundle.getText("excel.col.prctr"), type: EdmType.String },
						{ label: oBundle.getText("excel.col.importe"), property: oBundle.getText("excel.col.importe"), type: EdmType.Number, scale: 2 },
						{ label: oBundle.getText("excel.col.moneda"), property: oBundle.getText("excel.col.moneda"), type: EdmType.String },
						{ label: oBundle.getText("excel.col.descripcion"), property: oBundle.getText("excel.col.descripcion"), type: EdmType.String }
					];

					// 4) GENERAR EXCEL (usa el símbolo importado)
					let oSettings = {
						workbook: { columns: aColumns },
						dataSource: aRows,
						fileName: this._excelFileName(oBundle.getText("excel.filename"))
					};

					let oSheet = new Spreadsheet(oSettings);
					await oSheet.build();
					oSheet.destroy();

					MessageToast.show(oBundle.getText("excel.success"));
				} catch (e) {
					// eslint-disable-next-line no-console
					console.error("[onExportExcel]", e);
					let oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
					MessageToast.show(oBundle.getText("excel.error"));
				} finally {
					BusyIndicator.hide();
				}
			},



			/**
			 * Lee una colección OData una sola vez y devuelve un arreglo plano (results)
			 * Ajusta el modelo (por nombre) y parámetros según tu servicio
			 */
			_readOnce: function (sPath) {
				let oModel = this.getView().getModel("ZZ1_CCB_OD_XLS_CDS"); // ajusta el nombre
				return new Promise((resolve, reject) => {
					oModel.read(sPath, {
						urlParameters: { "$format": "json" },
						success: (oData) => {
							// OData V2: puede venir como { results: [...] } o directo según config
							let oResponse = (oData && (oData.results || oData.d?.results)) || [];
							console.log("oResponse", oResponse)
							resolve(oResponse);
						},
						error: reject
					});
				});
			},

			/**
			 * Convierte "/Date(1743465600000)/" a JS Date
			 */
			_parseSapDate: function (sSapDate) {
				if (!sSapDate || typeof sSapDate !== "string") return null;
				// Extrae milisegundos del literal ABAP
				let m = /Date\((\d+)\)/.exec(sSapDate);
				if (!m) return null;
				// Crea Date con esos ms (UTC). Excel usará sólo la parte de fecha.
				let n = Number(m[1]);
				if (Number.isNaN(n)) return null;
				return new Date(n);
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
			}



		});
	});
