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
],
	function (Controller, OdataUtilities, ODataModel, JSONModel, Fragment, MessageToast, MessageBox, Filter, FilterOperator, ComboBox, PDFViewer) {
		"use strict";

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


		});
	});
