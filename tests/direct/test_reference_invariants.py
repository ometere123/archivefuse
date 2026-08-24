import pytest
MAX_CLUSTER_MEMBERS=64; PERSON,PLACE,ORGANIZATION=1,2,3
def allowed(t,year,cutoff):
    if year<0 or year>2100:return False
    return year>0 and year<=cutoff if t==PERSON else True
def merge_size(a,b):
    if a+b>MAX_CLUSTER_MEMBERS: raise ValueError('cluster limit')
    return a+b
@pytest.mark.parametrize('year,cutoff,ok',[(1910,1950,True),(1951,1950,False),(0,1950,False)])
def test_person_cutoff(year,cutoff,ok): assert allowed(PERSON,year,cutoff) is ok
def test_non_person_can_omit_year(): assert allowed(PLACE,0,1900) and allowed(ORGANIZATION,0,1900)
def test_cluster_member_bound():
    assert merge_size(30,34)==64
    with pytest.raises(ValueError): merge_size(40,25)
