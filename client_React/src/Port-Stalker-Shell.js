import React from 'react';
import axios from 'axios';
import config from './config.json';
import qString from 'query-string';
import Loader from "./Loader";

class PortStalker extends React.Component{
    constructor(props){
        super(props)
        this.state={
            formMode: true,
            dataDevice: {},
            loader: false,
            inputIp:' ',
        }
        this.ReturnInputIpForm = this.ReturnInputIpForm.bind(this)
        this.RequestPortStalker = this.RequestPortStalker.bind(this)
        this.AfterInput = this.AfterInput.bind(this)
        this.ResponseTable = this.ResponseTable.bind(this)

        if (this.props.location.search!==''){
            let IpParams = qString.parse(this.props.location.search).ip
            axios.get(`${config.flask}/api/v1/PortStalker/`, { params: {ip: IpParams}})
        .then((res)=>{
            this.setState({dataDevice:res.data, formMode: false})
        })
        .catch((error) => {
            // if (typeof error.response.data == 'string'){
            //     alert(error.response.data)
            //   } else{
            //       for (let item in error.response.data){
            //         alert(error.response.data[item]);
            //       }}
            console.error(error);
          });
        }
    }

    RequestPortStalker(){
        this.setState({loader:true})
        let inputIp = document.getElementById('InputFormIp').value
        this.setState({inputIp:inputIp})
        axios.get(`${config.flask}/api/v1/PortStalker/`,{ params: {ip: inputIp}})
        .then((res)=>{
            this.setState({dataDevice:res.data, loader: false, formMode: false})
        })
        .catch((error) => {
            this.setState({loader:false, dataDevice: false, formMode: false})
            if (error.response){
                if (typeof error.response.data == 'string'){
                    alert(error.response.data)
                } else{
                    for (let item in error.response.data){
                        alert(error.response.data[item]);
                    }}}
            console.error(error);
          });
    }

    ReturnInputIpForm(){
        return(
            <div className="input-group col-md-6">
                <input className = "form-control" type="text" defaultValue={this.state.inputIp} id="InputFormIp"/>
                <input type="button" className="btn btn-outline-secondary" value="Find it !" onClick={this.RequestPortStalker}/>
            </div>
        );
    }

    ResponseTable(){
        if (this.state.dataDevice.header && this.state.dataDevice.request_rows){
            console.log(this.state.dataDevice.header.length);
            if (this.state.dataDevice.header.length !== 0){
                return(
                    <table className="table table-striped table-dark">
                        <tbody>
                            <tr>
                                {(this.state.dataDevice.header).map((head)=>{
                                            return(
                                                <th key={head}>{head}</th>
                                            )
                                        }
                                    )
                                }
                            </tr>
                            {(this.state.dataDevice.request_rows).map((Row)=>{
                                    return (<tr key={Row['port']}>{(this.state.dataDevice.header).map((head)=>{
                                            return(

                                                    <td key={head}>{Row[head]}</td>

                                            )
                                            })}</tr>)
                                        }
                                    )
                                }
                        </tbody>
                    </table>)
            } else {
                return (<h3>В MySql базе - не найден</h3>)
            }
        }  else {
            return '';
        }
    }

    AfterInput(){
        if (this.state.dataDevice.header || this.state.dataDevice.url_netbox){
            return(
                <div className="col-md-6">
                    <br/>
                        <this.ResponseTable/>
                    <br/>
                    <table className="table table-striped table-dark">
                        <tbody>
                            <tr>
                                <td>Device URL:</td>
                                <td><a className="stretched-link text-danger" href={this.state.dataDevice.url_netbox}>{this.state.dataDevice.url_netbox}</a></td>
                            </tr>

                            <tr>
                                <td>Device Name : </td>
                                <td>{this.state.dataDevice.dev_name}</td>
                            </tr>
                            <tr>
                                <td>Device Model : </td>
                                <td>{this.state.dataDevice.dev_model}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )
        } else if (this.state.formMode){
            return (<div className="col-md-6"><h3>Введите IP-address устройства</h3></div>);
        } else if(this.state.dataDevice){
            return (<div className="col-md-6"><h3>IP не найден</h3></div>);
        } else {
            return <h3>Ошибка подключения</h3>
        }
    }
    render(){
        if(this.state.loader){
            return <Loader/>
        } else {
            return(
            <div className="container">
                <this.ReturnInputIpForm/>
                <this.AfterInput/>
            </div>
            );
        }
    }

}

export default PortStalker